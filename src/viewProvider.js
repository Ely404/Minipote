const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class PetViewProvider {
    static viewType = 'minipote.petView';

    constructor(context) {
        this._context = context;
        this._view = null;
        this._stateManager = null;
    }

    setStateManager(manager) {
        this._stateManager = manager;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._context.extensionUri]
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => {
            if (!this._stateManager) return;

            switch (message.command) {
                case 'getCodingTime':
                    this.updateView();
                    break;
                case 'resetTime':
                    this._stateManager.resetAllData();
                    break;
                case 'changePath':
                    this._stateManager.changePath();
                    break;
                case 'changeTheme':
                    if (message.theme) {
                        this._stateManager.setTheme(message.theme);
                    }
                    break;
            }
        });
    }

    updateView() {
        if (!this._view || !this._stateManager) {
            return;
        }

        let liveTotalTime = this._stateManager._totalCodingTime;
        let liveWeeklyTime = this._stateManager._weeklyTime;
        let liveDailyTime = this._stateManager._dailyTime; // --- NEW ---

        if (this._stateManager._isActive && this._stateManager._codingStartTime) {
            const sessionTimeSeconds = (Date.now() - this._stateManager._codingStartTime) / 1000;
            const sessionTimeMinutes = sessionTimeSeconds / 60;
            liveWeeklyTime += sessionTimeMinutes;
            liveTotalTime += sessionTimeMinutes;
            liveDailyTime += sessionTimeMinutes; // --- NEW ---
        }
        
        const unlockedAchievements = this._context.globalState.get('minipote.achievements', []);

        // --- UPDATED: Add dailyTime to the message payload ---
        this._view.webview.postMessage({
            command: 'updateState',
            totalTime: liveTotalTime,
            weeklyTime: liveWeeklyTime,
            dailyTime: liveDailyTime, // --- NEW ---
            globalLevel: this._stateManager._globalLevel,
            isActive: this._stateManager._isActive,
            achievements: unlockedAchievements,
            selectedPath: this._stateManager._selectedPath,
            pathTimes: this._stateManager._pathTimes,
            theme: this._stateManager._theme,
        });
    }
    
    _getWebviewContent(webview) {
        const webviewPath = path.join(this._context.extensionPath, 'webview');
        const htmlPath = path.join(webviewPath, 'main.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

        const toUri = (filePath) => webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, filePath)));

        htmlContent = htmlContent
            .replace(/{{styleUri}}/g, toUri('main.css'))
            .replace(/{{scriptUri}}/g, toUri('main.js'));
            
        return htmlContent;
    }
}

module.exports = { PetViewProvider };