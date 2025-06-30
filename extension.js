const vscode = require('vscode');
const { PetViewProvider } = require('./src/viewProvider');
const { CodingStateManager } = require('./src/stateManager');
const { performMigration } = require('./src/dataMigration');

/**
 * This method is called when your extension is activated.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "Mini Pote" is now working !');

    // 1. Perform a one-time migration from the old data format if necessary.
    performMigration(context);

    // 2. Create the Webview provider.
    const provider = new PetViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(PetViewProvider.viewType, provider)
    );

    // 3. Create the State Manager, which handles all logic for time tracking,
    // state persistence, and achievements.
    const stateManager = new CodingStateManager(context, provider);
    stateManager.initialize(); // Load initial state and check for weekly reset.
    
    // 4. Register activity listeners to track user coding activity.
    const activityListener = () => stateManager.onActivity();
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(activityListener));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(activityListener));
    
    // 5. Register the State Manager for disposal to clean up timers.
    context.subscriptions.push(stateManager);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};