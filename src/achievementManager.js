const vscode = require('vscode');
const { ACHIEVEMENT_DEFINITIONS } = require('./constants');

function getAchievementsList() {
    return ACHIEVEMENT_DEFINITIONS.filter(ach => ach.type === 'global' || ach.type === 'time_based');
}

function calculateAnimalsUnlocked(weeklyTime) {
    const thresholds = [0, 15, 45, 90, 180, 300]; // in minutes
    return thresholds.filter(t => weeklyTime >= t).length;
}

function showWeeklySummary(weeklyTime, animalsUnlocked) {
    const hours = Math.floor(weeklyTime / 60);
    const minutes = weeklyTime % 60;
    const timeString = `${hours}h${minutes > 0 ? minutes + "min" : ""}`;
    vscode.window.showInformationMessage(
        `🎉 Résumé de la semaine ! Tu as codé ${timeString} et débloqué ${animalsUnlocked} formes d'évolution. Une nouvelle semaine commence ! 🚀`
    );
}

function checkAchievements(context, totalTime, weeklyTime, globalLevel) {
    const unlockedAchievements = context.globalState.get("minipote.achievements", []);
    const newAchievements = [];
    const allAchievements = getAchievementsList();

    for (const achievement of allAchievements) {
        if (!unlockedAchievements.includes(achievement.id) && achievement.condition(totalTime, weeklyTime, globalLevel, context)) {
            unlockedAchievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    }

    if (newAchievements.length > 0) {
        context.globalState.update("minipote.achievements", unlockedAchievements);
        for (const ach of newAchievements) {
            vscode.window.showInformationMessage(`🏆 Nouveau succès : ${ach.name} - ${ach.description}`);
        }
    }
}

function checkSessionAchievements(sessionDuration, context) {
    const sessionAchievements = ACHIEVEMENT_DEFINITIONS.filter(ach => ach.type === 'session');
    const unlockedAchievements = context.globalState.get("minipote.achievements", []);
    const newAchievements = [];

    for (const achievement of sessionAchievements) {
        if (!unlockedAchievements.includes(achievement.id) && achievement.condition(sessionDuration)) {
            unlockedAchievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    }

    if (newAchievements.length > 0) {
        context.globalState.update("minipote.achievements", unlockedAchievements);
        for (const ach of newAchievements) {
            vscode.window.showInformationMessage(`🏆 Nouveau succès : ${ach.name} - ${ach.description}`);
        }
    }
}

function checkWeeklyAchievements(context, lastWeekTime, animalsUnlocked) {
    const weeklyAchievements = ACHIEVEMENT_DEFINITIONS.filter(ach => ach.type === 'weekly');
    const unlockedAchievements = context.globalState.get("minipote.achievements", []);
    const newAchievements = [];

    for (const achievement of weeklyAchievements) {
        if (!unlockedAchievements.includes(achievement.id) && achievement.condition(lastWeekTime, animalsUnlocked)) {
            unlockedAchievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    }

    if (newAchievements.length > 0) {
        context.globalState.update("minipote.achievements", unlockedAchievements);
    }
}


module.exports = {
    getAchievementsList,
    calculateAnimalsUnlocked,
    showWeeklySummary,
    checkAchievements,
    checkSessionAchievements,
    checkWeeklyAchievements
};