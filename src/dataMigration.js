const vscode = require('vscode');

const MIGRATION_KEY = 'minipote.migrated';
const OLD_PREFIX = 'dragoncode.';
const NEW_PREFIX = 'minipote.';

const OLD_KEYS = [
    'totalTime', 'weeklyTime', 'globalLevel', 'lastReset', 
    'achievements', 'consecutiveWeeks', 'lastWeekTime', 'lastWeekAnimals'
];

/**
 * Checks if data from an older version of the extension exists and migrates it.
 * This function should only run once.
 * @param {vscode.ExtensionContext} context 
 */
function performMigration(context) {
    if (context.globalState.get(MIGRATION_KEY)) {
        return; // Migration has already been done.
    }

    let migrationPerformed = false;
    OLD_KEYS.forEach(key => {
        const oldValue = context.globalState.get(`${OLD_PREFIX}${key}`);
        if (oldValue !== undefined) {
            migrationPerformed = true;
            // Copy to new key
            context.globalState.update(`${NEW_PREFIX}${key}`, oldValue);
            // Delete old key
            context.globalState.update(`${OLD_PREFIX}${key}`, undefined);
        }
    });

    // Mark migration as complete
    context.globalState.update(MIGRATION_KEY, true);

    if (migrationPerformed) {
        vscode.window.showInformationMessage("Mini Pote a été mis à jour et vos données ont été migrées !");
    }
}

module.exports = { performMigration };