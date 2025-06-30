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

    /**
     * Initializes the state manager by loading data and starting timers.
     */
    initialize() {
        this._loadState();
        this._checkWeeklyReset();
        this._startTimers();
        this._provider.setStateManager(this); // Give provider a reference to this manager
    }

    /**
     * Loads the state from VS Code's global storage.
     */
    _loadState() {
        this._totalCodingTime = this._context.globalState.get('minipote.totalTime', 0);
        this._weeklyTime = this._context.globalState.get('minipote.weeklyTime', 0);
        this._globalLevel = this._context.globalState.get('minipote.globalLevel', 1);
    }
    
    /**
     * Handles a user activity event.
     */
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
            const sessionDuration = Math.floor((Date.now() - this._codingStartTime) / 60000); // in minutes
            
            if (sessionDuration > 0) {
                this._totalCodingTime += sessionDuration;
                this._weeklyTime += sessionDuration;
                this._context.globalState.update("minipote.totalTime", this._totalCodingTime);
                this._context.globalState.update("minipote.weeklyTime", this._weeklyTime);
                achievementManager.checkSessionAchievements(sessionDuration, this._context);
            }
            this._provider.updateView(this._totalCodingTime, this._weeklyTime, false, this._globalLevel);
        }
    }

    _resetInactivityTimer() {
        clearTimeout(this._inactivityTimer);
        this._inactivityTimer = setTimeout(() => this._stopCoding(), INACTIVITY_TIMEOUT_MS);
    }

    /**
     * Starts the periodic timers for UI updates and data saving.
     */
    _startTimers() {
        this._updateTimer = setInterval(() => {
            if (this._isActive) {
                // Calculate live time for smooth UI updates (10s interval)
                const sessionTimeSeconds = Math.floor((Date.now() - this._codingStartTime) / 10000) * 10;
                const liveWeeklyTime = this._weeklyTime + (sessionTimeSeconds / 60);
                const liveTotalTime = this._totalCodingTime + (sessionTimeSeconds / 60);
                this._provider.updateView(liveTotalTime, liveWeeklyTime, true, this._globalLevel);
            }
        }, UI_UPDATE_INTERVAL_MS);

        this._saveTimer = setInterval(() => {
            // Persist state and check for level-ups/achievements every minute
            const liveTotalTime = this._isActive ? this._totalCodingTime + Math.floor((Date.now() - this._codingStartTime) / 60000) : this._totalCodingTime;
            const liveWeeklyTime = this._isActive ? this._weeklyTime + Math.floor((Date.now() - this._codingStartTime) / 60000) : this._weeklyTime;

            const newGlobalLevel = Math.floor(liveTotalTime / 60) + 1;
            if (newGlobalLevel > this._globalLevel) {
                this._globalLevel = newGlobalLevel;
                this._context.globalState.update('minipote.globalLevel', this._globalLevel);
            }
            achievementManager.checkAchievements(this._context, liveTotalTime, liveWeeklyTime, this._globalLevel);
        }, SAVE_INTERVAL_MS);
    }

    _checkWeeklyReset() {
        const lastResetTimestamp = this._context.globalState.get("minipote.lastReset", 0);
        const now = new Date();
        const lastResetDate = new Date(lastResetTimestamp);
    
        // Calculate the date of the most recent Monday
        const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1, ...
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

            // Update consecutive weeks
            let consecutiveWeeks = this._context.globalState.get("minipote.consecutiveWeeks", 0);
            consecutiveWeeks = lastWeekTime >= 300 ? consecutiveWeeks + 1 : 0; // 300 mins = 5 hours
            this._context.globalState.update("minipote.consecutiveWeeks", consecutiveWeeks);

            // Store last week's data and reset current week
            this._context.globalState.update("minipote.lastWeekTime", lastWeekTime);
            this._weeklyTime = 0;
            this._context.globalState.update("minipote.weeklyTime", 0);
            this._context.globalState.update("minipote.lastReset", new Date().getTime());
        }
    }
    
    resetAllData() {
        this._stopCoding(); // Ensure any active session is stopped and saved
        this._totalCodingTime = 0;
        this._weeklyTime = 0;
        this._globalLevel = 1;
        this._isActive = false;
        
        this._context.globalState.update('minipote.totalTime', 0);
        this._context.globalState.update('minipote.weeklyTime', 0);
        this._context.globalState.update('minipote.globalLevel', 1);
        this._context.globalState.update('minipote.consecutiveWeeks', 0);
        this._context.globalState.update('minipote.achievements', []);

        this._provider.updateView(0, 0, false, 1);
    }

    /**
     * Implements the disposable pattern to clean up timers.
     */
    dispose() {
        clearTimeout(this._inactivityTimer);
        clearInterval(this._updateTimer);
        clearInterval(this._saveTimer);
        this._stopCoding();
    }
}

module.exports = { CodingStateManager };