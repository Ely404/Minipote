const vscode = require('vscode');
const achievementManager = require('./achievementManager');
const { animalPaths } = require('./constants'); // We need the path count

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
        
        this._selectedPath = 0;
        this._pathTimes = {};
        
        // --- NEW: Add theme state ---
        this._theme = 'default';
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
        this._selectedPath = this._context.globalState.get('minipote.selectedPath', 0);
        this._pathTimes = this._context.globalState.get('minipote.pathTimes', {});
        
        // --- NEW: Load theme from persistent storage ---
        this._theme = this._context.globalState.get('minipote.theme', 'default');
    }
    
    onActivity() {
        this._startCoding();
        this._resetInactivityTimer();
    }

    _startCoding() {
        if (!this._isActive) {
            this._isActive = true;
            this._codingStartTime = Date.now();
            this._provider.updateView();
        }
    }

    _stopCoding() {
        if (this._isActive) {
            this._isActive = false;
            this._commitSessionTimeToState();
            
            const finalSessionDuration = Math.floor((Date.now() - (this._codingStartTime || Date.now())) / 60000);
            achievementManager.checkSessionAchievements(finalSessionDuration, this._context);
            
            this._provider.updateView();
        }
    }

    _resetInactivityTimer() {
        clearTimeout(this._inactivityTimer);
        this._inactivityTimer = setTimeout(() => this._stopCoding(), INACTIVITY_TIMEOUT_MS);
    }

    _commitSessionTimeToState() {
        if (!this._isActive || !this._codingStartTime) {
            return;
        }

        const sessionDurationMinutes = Math.floor((Date.now() - this._codingStartTime) / 60000);

        if (sessionDurationMinutes > 0) {
            this._totalCodingTime += sessionDurationMinutes;
            this._weeklyTime += sessionDurationMinutes;
            
            this._pathTimes[this._selectedPath] = (this._pathTimes[this._selectedPath] || 0) + sessionDurationMinutes;
            
            this._context.globalState.update("minipote.totalTime", this._totalCodingTime);
            this._context.globalState.update("minipote.weeklyTime", this._weeklyTime);
            this._context.globalState.update("minipote.pathTimes", this._pathTimes);

            this._codingStartTime += sessionDurationMinutes * 60000;
        }
    }

    _startTimers() {
        this._updateTimer = setInterval(() => {
            this._provider.updateView();
        }, UI_UPDATE_INTERVAL_MS);

        this._saveTimer = setInterval(() => {
             if (this._isActive) {
                this._commitSessionTimeToState();
            }
            
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
            
            this._pathTimes = {};
            this._context.globalState.update("minipote.pathTimes", {});
            
            this._weeklyTime = 0;
            this._context.globalState.update("minipote.weeklyTime", 0);
            this._context.globalState.update("minipote.consecutiveWeeks", consecutiveWeeks);
            this._context.globalState.update("minipote.lastWeekTime", lastWeekTime);
            this._context.globalState.update("minipote.lastReset", new Date().getTime());
        }
    }
    
    changePath() {
        let newPath;
        do {
            newPath = Math.floor(Math.random() * animalPaths.length);
        } while (newPath === this._selectedPath);
        
        this._selectedPath = newPath;
        this._context.globalState.update('minipote.selectedPath', this._selectedPath);
        this._provider.updateView();
    }
    
    // --- NEW: Method to set and save the theme ---
    setTheme(themeName) {
        this._theme = themeName;
        this._context.globalState.update('minipote.theme', this._theme);
        this._provider.updateView();
    }
    
    resetAllData() {
        this._stopCoding();
        this._totalCodingTime = 0; this._weeklyTime = 0; this._globalLevel = 1; this._isActive = false;
        this._selectedPath = 0; this._pathTimes = {};
        
        // --- NEW: Reset theme to default ---
        this._theme = 'default';

        this._context.globalState.update('minipote.totalTime', 0);
        this._context.globalState.update('minipote.weeklyTime', 0);
        this._context.globalState.update('minipote.globalLevel', 1);
        this._context.globalState.update('minipote.consecutiveWeeks', 0);
        this._context.globalState.update('minipote.achievements', []);
        this._context.globalState.update('minipote.selectedPath', 0);
        this._context.globalState.update('minipote.pathTimes', {});
        this._context.globalState.update('minipote.theme', 'default');
        
        this._provider.updateView();
    }

    dispose() {
        clearTimeout(this._inactivityTimer);
        clearInterval(this._updateTimer);
        clearInterval(this._saveTimer);
        this._stopCoding();
    }
}

module.exports = { CodingStateManager };