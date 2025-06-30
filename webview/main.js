// webview/main.js
(function () {
    const vscode = acquireVsCodeApi();

    // --- STATE ---
    let codingTime = 0, globalLevel = 1, isActive = false, unlockedAchievements = [];
    let pathTimes = {};
    let lastKnownWeeklyTime = 0;

    // --- CONSTANTS ---
    const animalPaths = [
        // Path 0: Dragon
        [
            { emoji: "🥚", name: "Œuf de Dragon", minTime: 0 },
            { emoji: "🦎", name: "Bébé Lézard", minTime: 15 },
            { emoji: "🐲", name: "Jeune Dragon", minTime: 45 },
            { emoji: "🐉", name: "Dragon Noble", minTime: 90 },
            { emoji: "🦖", name: "Dragon Ancien", minTime: 180 },
            { emoji: "🌌", name: "Dragon Cosmique", minTime: 300 }
        ],
        // Path 1: Unicorn
        [
            { emoji: "🥚", name: "Œuf Scintillant", minTime: 0 },
            { emoji: "🐎", name: "Poulain Sauvage", minTime: 15 },
            { emoji: "🦄", name: "Jeune Licorne", minTime: 45 },
            { emoji: "💫", name: "Licorne Astrale", minTime: 90 },
            { emoji: "💎", name: "Licorne de Cristal", minTime: 180 },
            { emoji: "🌠", name: "Comète Vivante", minTime: 300 }
        ],
        // Path 2: Robot
        [
            { emoji: "💡", name: "Idée Brillante", minTime: 0 },
            { emoji: "⚙️", name: "Prototype Mécanique", minTime: 15 },
            { emoji: "🤖", name: "Robot Assembleur", minTime: 45 },
            { emoji: "🦾", name: "Cyborg Intégré", minTime: 90 },
            { emoji: "🧠", name: "Intelligence Artificielle", minTime: 180 },
            { emoji: "🌐", name: "Conscience Globale", minTime: 300 }
        ],
        // Path 3: Ocean
        [
            { emoji: "🐚", name: "Coquillage Ancien", minTime: 0 },
            { emoji: "🐠", name: "Poisson Agile", minTime: 15 },
            { emoji: "🐙", name: "Pieuvre Stratège", minTime: 45 },
            { emoji: "🦈", name: "Grand Requin Blanc", minTime: 90 },
            { emoji: "🐋", name: "Baleine Colossale", minTime: 180 },
            { emoji: "🔱", name: "Gardien des Océans", minTime: 300 }
        ],
        // Path 4: Space
        [
            { emoji: "☄️", name: "Comète Errante", minTime: 0 },
            { emoji: "🛰️", name: "Sonde d'Exploration", minTime: 15 },
            { emoji: "🧑‍🚀", name: "Pilote Stellaire", minTime: 45 },
            { emoji: "🚀", name: "Capitaine de Fusée", minTime: 90 },
            { emoji: "🛸", name: "Commandant de Flotte", minTime: 180 },
            { emoji: "🌌", name: "Maître de la Galaxie", minTime: 300 }
        ],
        // Path 5: Mystic
        [
            { emoji: "🌱", name: "Graine Enchantée", minTime: 0 },
            { emoji: "✨", name: "Feu Follet", minTime: 15 },
            { emoji: "🧚", name: "Fée des Bois", minTime: 45 },
            { emoji: "🧙", name: "Sorcier Élémentaire", minTime: 90 },
            { emoji: "🧞", name: "Génie Puissant", minTime: 180 },
            { emoji: "🌀", name: "Esprit du Vortex", minTime: 300 }
        ],
        // Path 6: Jungle
        [
            { emoji: "🐾", name: "Traces Mystérieuses", minTime: 0 },
            { emoji: "🐈", name: "Chaton Furtif", minTime: 15 },
            { emoji: "🐆", name: "Léopard Agile", minTime: 45 },
            { emoji: "🐅", name: "Tigre Impitoyable", minTime: 90 },
            { emoji: "🦁", name: "Lion, Roi de la Jungle", minTime: 180 },
            { emoji: "🌳", name: "Esprit Gardien de la Forêt", minTime: 300 }
        ],
        // Path 7: Ice
        [
            { emoji: "💧", name: "Goutte d'Eau Pure", minTime: 0 },
            { emoji: "🧊", name: "Cœur de Glace", minTime: 15 },
            { emoji: "❄️", name: "Cristal de Givre", minTime: 45 },
            { emoji: "👻", name: "Spectre de Froid", minTime: 90 },
            { emoji: "🐺", name: "Loup des Neiges", minTime: 180 },
            { emoji: "💎", name: "Golem de Diamant", minTime: 300 }
        ]
    ];

    const achievementsList = [
        { id: "warming_up", name: "Échauffement", description: "Coder pendant 10 minutes", emoji: "🔥" },
        { id: "first_hour", name: "Premier Pas", description: "Coder pendant 1 heure", emoji: "👶" },
        { id: "in_the_zone", name: "Dans la Zone", description: "Coder pendant 2 heures sans interruption", emoji: "🧘" },
        { id: "coding_apprentice", name: "Apprenti Codeur", description: "Atteindre le niveau 5", emoji: "🎓" },
        { id: "coding_master", name: "Maître Codeur", description: "Atteindre le niveau 10", emoji: "👑" },
        { id: "coding_legend", name: "Légende du Code", description: "Atteindre le niveau 20", emoji: "⚡" },
        { id: "marathon_coder", name: "Marathonien", description: "Coder pendant 50 heures au total", emoji: "🏃‍♂️" },
        { id: "dedication", name: "Dévouement", description: "Coder pendant 100 heures au total", emoji: "💪" },
        { id: "code_god", name: "Dieu du Code", description: "Coder pendant 250 heures au total", emoji: "🙏" },
        { id: "week_starter", name: "Bon Début", description: "Coder 5h en une semaine", emoji: "🌟" },
        { id: "week_warrior", name: "Guerrier Hebdomadaire", description: "Coder plus de 10h en une semaine", emoji: "⚔️" },
        { id: "week_master", name: "Maître de la Semaine", description: "Coder plus de 20h en une semaine", emoji: "🏆" },
        { id: "evolution_master", name: "Maître Évolution", description: "Débloquer toutes les évolutions en une semaine", emoji: "🎭" },
        { id: "consistency", name: "Régularité", description: "Compléter 3 semaines consécutives avec au moins 5h", emoji: "📅" },
        { id: "early_bird", name: "Lève-tôt", description: "Coder entre 6h et 8h du matin", emoji: "🐦" },
        { id: "night_owl", name: "Oiseau de Nuit", description: "Coder entre 22h et 6h du matin", emoji: "🦉" },
        { id: "weekend_warrior", name: "Guerrier du Weekend", description: "Coder un Samedi ou un Dimanche", emoji: "🛡️" },
        { id: "versatile_coder", name: "Codeur Polyvalent", description: 'Débloquer "Lève-tôt" et "Oiseau de Nuit"', emoji: "🌗" } 
    ];

    const messages = [
        "Continue comme ça, tu fais du super boulot ! 💪",
        "N'oublie pas de boire de l'eau ! 💧",
        "Prendre une pause, c'est important ! 😌",
        "Tu deviens un vrai pro ! 🚀",
        "Wow, regarde comme j'ai grandi grâce à toi ! ✨",
        "Un petit café ? ☕",
        "Fais une pause pour tes yeux ! 👀",
        "J'adore coder avec toi ! 💖",
        "On forme une super équipe ! 🤝",
        "Tu progresses à une vitesse incroyable ! 🏃‍♂️",
        "Étire-toi un peu, ça fait du bien ! 🤸‍♀️",
        "Tu es mon humain préféré ! 🥰",
        "Bravo pour tes nouveaux succès ! 🏆",
        "Tu es sur la bonne voie pour le prochain niveau ! 📈",
        "Cette semaine est excellente ! 🌟"
    ];

    // --- DOM ELEMENTS ---
    const dom = {
        petEmoji: document.getElementById('petEmoji'), petName: document.getElementById('petName'), petMessage: document.getElementById('petMessage'),
        globalLevel: document.getElementById('globalLevel'), weeklyTime: document.getElementById('weeklyTime'), totalTime: document.getElementById('totalTime'),
        expFill: document.getElementById('expFill'), expPercentage: document.getElementById('expPercentage'), currentPath: document.getElementById('currentPath'),
        nextEvolutionInfo: document.getElementById('nextEvolutionInfo'), status: document.getElementById('status'),
        achievements: { summary: document.getElementById('achievementsSummary'), summaryText: document.getElementById('summaryText'), list: document.getElementById('achievementsList'), pendingList: document.getElementById('pendingAchievements'), showAllBtn: document.getElementById('showAllBtn') }
    };

    // --- INITIALIZATION ---
    let selectedPath = parseInt(localStorage.getItem('minipote-path') || Math.floor(Math.random() * animalPaths.length));
    if (selectedPath >= animalPaths.length) selectedPath = 0;
    
    pathTimes = JSON.parse(localStorage.getItem('minipote-path-times')) || {};
    lastKnownWeeklyTime = JSON.parse(localStorage.getItem('minipote-last-weekly-time')) || 0;

    let currentAnimalPath = animalPaths[selectedPath];

    // --- UI UPDATE FUNCTIONS ---
    function updateDisplay() {
        updatePetEvolution();
        updateStats();
        updateStatus();
        updateAchievements();
    }

    function updatePetEvolution() {
        const timeForThisPath = pathTimes[selectedPath] || 0;
        let currentAnimal = currentAnimalPath[0];
        for (const animal of currentAnimalPath) {
            if (timeForThisPath >= animal.minTime) {
                currentAnimal = animal;
            }
        }
        dom.petEmoji.textContent = currentAnimal.emoji;
        dom.petName.textContent = currentAnimal.name;
        
        const pathNames = ['Dragon 🐲', 'Licorne 🦄', 'Robot 🤖', 'Océan 🌊', 'Espace 🛸', 'Mystique 🧚', 'Jungle 🌳', 'Glace ❄️'];
        dom.currentPath.textContent = pathNames[selectedPath] || 'Mystère 🎭';

        const currentIndex = currentAnimalPath.findIndex(a => a.name === currentAnimal.name);
        if (currentIndex < currentAnimalPath.length - 1) {
            const nextAnimal = currentAnimalPath[currentIndex + 1];
            const timeToNext = Math.ceil(nextAnimal.minTime - timeForThisPath);
            if (timeToNext > 0) {
                dom.nextEvolutionInfo.textContent = `Nouvelle évolution (${nextAnimal.name}) dans : ${timeToNext} min`;
                dom.nextEvolutionInfo.style.display = 'block';
            } else {
                dom.nextEvolutionInfo.style.display = 'none';
            }
        } else {
            dom.nextEvolutionInfo.textContent = '✨ Évolution maximale atteinte pour ce chemin !';
            dom.nextEvolutionInfo.style.display = 'block';
        }
    }

    function updateStats() {
        dom.globalLevel.textContent = globalLevel;
        dom.weeklyTime.textContent = formatTime(lastKnownWeeklyTime);
        dom.totalTime.textContent = formatTime(codingTime);

        const expPercentage = (codingTime % 60) * (100 / 60);
        dom.expFill.style.width = expPercentage + '%';
        dom.expPercentage.textContent = Math.floor(expPercentage) + '%';
    }

    function updateStatus() {
        if (isActive) {
            dom.status.textContent = '🔥 En train de coder !';
            dom.status.className = 'status';
            dom.petEmoji.classList.add('excited');
        } else {
            dom.status.textContent = '💤 En pause...';
            dom.status.className = 'status inactive';
            dom.petEmoji.classList.remove('excited');
        }
    }

    function updateAchievements() {
        const unlockedCount = unlockedAchievements.length;
        const { summary, list, pendingList, summaryText } = dom.achievements;
        list.innerHTML = '';
        pendingList.innerHTML = '';
        if (unlockedCount === 0) {
            summary.style.display = 'none';
            list.innerHTML = `<div style="opacity: 0.6; text-align: center; padding: 20px;">Commence à coder pour débloquer des trophées !</div>`;
        } else {
            unlockedAchievements.slice().sort((a, b) => achievementsList.findIndex(ac => ac.id === a) - achievementsList.findIndex(ac => ac.id === b)).forEach(id => {
                const ach = achievementsList.find(a => a.id === id);
                if (ach) list.appendChild(createAchievementElement(ach, false));
            });
        }
        if (unlockedCount > 4) {
            summary.style.display = 'flex';
            summaryText.textContent = `🏆 Tu as débloqué ${unlockedCount} succès !`;
            list.style.display = 'none';
        } else {
            summary.style.display = 'none';
            list.style.display = 'block';
        }
        achievementsList.forEach(ach => {
            if (!unlockedAchievements.includes(ach.id)) {
                pendingList.appendChild(createAchievementElement(ach, true));
            }
        });
    }

    function createAchievementElement(ach, isPending) {
        const el = document.createElement('div');
        el.className = isPending ? 'pending-achievement' : 'achievement';
        el.innerHTML = `<div class="achievement-emoji" style="${isPending ? 'opacity: 0.5;' : ''}">${ach.emoji}</div><div class="achievement-info"><div class="achievement-name">${ach.name}</div><div class="achievement-desc">${ach.description}</div></div>`;
        return el;
    }

    function formatTime(minutes) {
        minutes = Math.floor(minutes);
        if (minutes < 60) return minutes + 'min';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h + 'h' + (m > 0 ? m + 'min' : '');
    }

    // --- EVENT LISTENERS ---
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'updateTime') {
            ({ time: codingTime, globalLevel, isActive, achievements: unlockedAchievements } = message);
            const newTotalWeeklyTime = message.weeklyTime;

            // Check for weekly reset first
            if (newTotalWeeklyTime < lastKnownWeeklyTime) {
                pathTimes = {};
                lastKnownWeeklyTime = 0;
            }

            // Calculate time gained since the last update
            const timeGained = newTotalWeeklyTime - lastKnownWeeklyTime;

            // Add the gained time to the currently active path
            if (timeGained > 0) {
                pathTimes[selectedPath] = (pathTimes[selectedPath] || 0) + timeGained;
            }

            // Update the 'last known' total to the new total
            lastKnownWeeklyTime = newTotalWeeklyTime;

            // Save the state to localStorage
            localStorage.setItem('minipote-path-times', JSON.stringify(pathTimes));
            localStorage.setItem('minipote-last-weekly-time', JSON.stringify(lastKnownWeeklyTime));

            updateDisplay();
        }
    });

    dom.achievements.showAllBtn.addEventListener('click', () => {
        dom.achievements.summary.style.display = 'none';
        dom.achievements.list.style.display = 'block';
    });

    let petClickCount = 0;
    dom.petEmoji.addEventListener('click', () => {
        petClickCount++;
        setTimeout(() => {
            if (petClickCount === 3) {
                let newPath;
                do { newPath = Math.floor(Math.random() * animalPaths.length); } while (newPath === selectedPath);
                
                selectedPath = newPath;
                currentAnimalPath = animalPaths[selectedPath];
                localStorage.setItem('minipote-path', selectedPath.toString());
                
                dom.petMessage.textContent = "J'ai découvert un nouveau chemin évolutif !";
                updateDisplay();
            }
            petClickCount = 0;
        }, 500);
    });

    // --- INTERVALS & INITIALIZATION ---
    setInterval(() => {
        if (isActive && Math.random() < 0.3) {
            dom.petMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
        }
    }, 120000);

    vscode.postMessage({ command: 'getCodingTime' });
}());