const vscode = require('vscode');
const achievementManager = require('./achievementManager');

const INACTIVITY_TIMEOUT_MS = 300000; // 5 minutes
const UI_UPDATE_INTERVAL_MS = 10000;   // 10 seconds
const SAVE_INTERVAL_MS = 60000;       // 1 minute

class CodingStateManager {
    constructor(context, provider) {
        this._context = context;
        this._provider = provider;
        
        this._codingStartTime = null;
        this._isActive = false;
        this._totalCodingTime = 0; // in minutes
        this._weeklyTime = 0;      // in minutes
        this._globalLevel = 1;
        
        this._inactivityTimer = null;
        this._updateTimer = null;
        this._saveTimer = null;
    }

    initialize() {
        this._loadState();
        this._checkWeeklyReset();
        this._startTimers();
        this._provider.setStateManager(this);
    }

    _loadState() {
        this._totalCodingTime = this._context.globalState.get('minipote.totalTime', 0);
        this._weeklyTime = this._context.globalState.get('minipote.weeklyTime', 0);
        this._globalLevel = this._context.globalState.get('minipote.globalLevel', 1);
    }
    
    onActivity() {
        this._startCoding();
        this._resetInactivityTimer();
    }

    _startCoding() {
        if (!this._isActive) {
            this._isActive = true;
            this._codingStartTime = Date.now();
            this._provider.updateView(this._totalCodingTime, this._weeklyTime, true, this._globalLevel);
        }
    }

    _stopCoding() {
        if (this._isActive) {
            this._isActive = false;
            // On stop, we save any remaining fraction of a minute from the session.
            this._commitSessionTimeToState();
            
            // The check for session achievements can still be useful for short sessions
            const finalSessionDuration = Math.floor((Date.now() - (this._codingStartTime || Date.now())) / 60000);
            achievementManager.checkSessionAchievements(finalSessionDuration, this._context);
            
            this._provider.updateView(this._totalCodingTime, this._weeklyTime, false, this._globalLevel);
        }
    }

    _resetInactivityTimer() {
        clearTimeout(this._inactivityTimer);
        this._inactivityTimer = setTimeout(() => this._stopCoding(), INACTIVITY_TIMEOUT_MS);
    }

    /**
     * Commits the current session's elapsed time to the state variables and saves to disk.
     * This is the core of the fix.
     */
    _commitSessionTimeToState() {
        if (!this._isActive || !this._codingStartTime) {
            return;
        }

        const sessionDurationMinutes = Math.floor((Date.now() - this._codingStartTime) / 60000);

        if (sessionDurationMinutes > 0) {
            // Add the elapsed full minutes to our state
            this._totalCodingTime += sessionDurationMinutes;
            this._weeklyTime += sessionDurationMinutes;

            // Persist the new totals to disk immediately
            this._context.globalState.update("minipote.totalTime", this._totalCodingTime);
            this._context.globalState.update("minipote.weeklyTime", this._weeklyTime);

            // IMPORTANT: Reset the start time to now, so we don't double-count these minutes later.
            // We keep the milliseconds for the next calculation.
            this._codingStartTime += sessionDurationMinutes * 60000;
        }
    }

    _startTimers() {
        this._updateTimer = setInterval(() => {
            if (this._isActive) {
                const sessionTimeSeconds = (Date.now() - this._codingStartTime) / 1000;
                const liveWeeklyTime = this._weeklyTime + (sessionTimeSeconds / 60);
                const liveTotalTime = this._totalCodingTime + (sessionTimeSeconds / 60);
                this._provider.updateView(liveTotalTime, liveWeeklyTime, true, this._globalLevel);
            }
        }, UI_UPDATE_INTERVAL_MS);

        // This timer is now the primary SAVE mechanism.
        this._saveTimer = setInterval(() => {
            // If active, commit the last minute of work to the state and save it.
            if (this._isActive) {
                this._commitSessionTimeToState();
            }

            // The level-up and achievement checks can now use the reliably saved values.
            const newGlobalLevel = Math.floor(this._totalCodingTime / 60) + 1;
            if (newGlobalLevel > this._globalLevel) {
                this._globalLevel = newGlobalLevel;
                this._context.globalState.update('minipote.globalLevel', this._globalLevel);
            }
            achievementManager.checkAchievements(this._context, this._totalCodingTime, this._weeklyTime, this._globalLevel);
        }, SAVE_INTERVAL_MS);
    }

    _checkWeeklyReset() {
        const lastResetTimestamp = this._context.globalState.get("minipote.lastReset", 0);
        const now = new Date();
        const lastResetDate = new Date(lastResetTimestamp);
        const dayOfWeek = now.getDay();
        const daysSinceMonday = (dayOfWeek + 6) % 7;
        const recentMonday = new Date(now);
        recentMonday.setDate(now.getDate() - daysSinceMonday);
        recentMonday.setHours(0, 0, 0, 0);
    
        if (lastResetDate < recentMonday) {
            const lastWeekTime = this._context.globalState.get("minipote.weeklyTime", 0);
            if (lastWeekTime > 0) {
                const animalsUnlocked = achievementManager.calculateAnimalsUnlocked(lastWeekTime);
                achievementManager.showWeeklySummary(lastWeekTime, animalsUnlocked);
                achievementManager.checkWeeklyAchievements(this._context, lastWeekTime, animalsUnlocked);
            }
            let consecutiveWeeks = this._context.globalState.get("minipote.consecutiveWeeks", 0);
            consecutiveWeeks = lastWeekTime >= 300 ? consecutiveWeeks + 1 : 0;
            this._context.globalState.update("minipote.consecutiveWeeks", consecutiveWeeks);
            this._context.globalState.update("minipote.lastWeekTime", lastWeekTime);
            this._weeklyTime = 0;
            this._context.globalState.update("minipote.weeklyTime", 0);
            this._context.globalState.update("minipote.lastReset", new Date().getTime());
        }
    }
    
    resetAllData() {
        this._stopCoding();
        this._totalCodingTime = 0; this._weeklyTime = 0; this._globalLevel = 1; this._isActive = false;
        this._context.globalState.update('minipote.totalTime', 0);
        this._context.globalState.update('minipote.weeklyTime', 0);
        this._context.globalState.update('minipote.globalLevel', 1);
        this._context.globalState.update('minipote.consecutiveWeeks', 0);
        this._context.globalState.update('minipote.achievements', []);
        this._provider.updateView(0, 0, false, 1);
    }

    dispose() {
        clearTimeout(this._inactivityTimer);
        clearInterval(this._updateTimer);
        clearInterval(this._saveTimer);
        // This final call to _stopCoding will save any leftover seconds from the last minute.
        this._stopCoding();
    }
}

module.exports = { CodingStateManager };