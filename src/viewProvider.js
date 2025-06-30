const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const achievementManager = require('./achievementManager');
const { PET_MESSAGES } = require('./constants');


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
            switch (message.command) {
                case 'getCodingTime':
                    // On initial load, send all the current data
                    if (this._stateManager) {
                       this.updateView(
                           this._stateManager._totalCodingTime, 
                           this._stateManager._weeklyTime, 
                           this._stateManager._isActive, 
                           this._stateManager._globalLevel
                        );
                    }
                    break;
                case 'resetTime':
                    // Delegate reset logic to the state manager
                    if (this._stateManager) {
                        this._stateManager.resetAllData();
                    }
                    break;
            }
        });
    }

    updateView(totalTime, weeklyTime, isActive, globalLevel) {
        if (this._view) {
            const unlockedAchievements = this._context.globalState.get('minipote.achievements', []);
            this._view.webview.postMessage({
                command: 'updateTime',
                time: totalTime,
                weeklyTime: weeklyTime,
                globalLevel: globalLevel,
                isActive: isActive,
                achievements: unlockedAchievements
            });
        }
    }
    
    _getWebviewContent(webview) {
        const webviewPath = path.join(this._context.extensionPath, 'webview');
        const htmlPath = path.join(webviewPath, 'main.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf-8');

        // Function to generate webview-safe URIs
        const toUri = (filePath) => webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, filePath)));

        // Replace placeholders with the correct URIs
        htmlContent = htmlContent
            .replace(/{{styleUri}}/g, toUri('main.css'))
            .replace(/{{scriptUri}}/g, toUri('main.js'));
            
        return htmlContent;
    }
}

module.exports = { PetViewProvider };