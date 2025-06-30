const ACHIEVEMENT_DEFINITIONS = [
    // Time-based (total coding time)
    { id: "warming_up", name: "Échauffement", description: "Coder pendant 10 minutes", emoji: "🔥", type: 'time_based', condition: (total) => total >= 10 },
    { id: "first_hour", name: "Premier Pas", description: "Coder pendant 1 heure", emoji: "👶", type: 'time_based', condition: (total) => total >= 60 },
    { id: "marathon_coder", name: "Marathonien", description: "Coder pendant 50 heures au total", emoji: "🏃‍♂️", type: 'time_based', condition: (total) => total >= 3000 },
    { id: "dedication", name: "Dévouement", description: "Coder pendant 100 heures au total", emoji: "💪", type: 'time_based', condition: (total) => total >= 6000 },
    { id: "code_god", name: "Dieu du Code", description: "Coder pendant 250 heures au total", emoji: "🙏", type: 'time_based', condition: (total) => total >= 15000 },

    // Level-based
    { id: "coding_apprentice", name: "Apprenti Codeur", description: "Atteindre le niveau 5", emoji: "🎓", type: 'global', condition: (total, weekly, level) => level >= 5 },
    { id: "coding_master", name: "Maître Codeur", description: "Atteindre le niveau 10", emoji: "👑", type: 'global', condition: (total, weekly, level) => level >= 10 },
    { id: "coding_legend", name: "Légende du Code", description: "Atteindre le niveau 20", emoji: "⚡", type: 'global', condition: (total, weekly, level) => level >= 20 },
    
    // Weekly Time-based (checked at end of week)
    { id: "week_starter", name: "Bon Début", description: "Coder 5h en une semaine", emoji: "🌟", type: 'global', condition: (total, weekly) => weekly >= 300 },
    { id: "week_warrior", name: "Guerrier Hebdomadaire", description: "Coder plus de 10h en une semaine", emoji: "⚔️", type: 'weekly', condition: (weeklyTime) => weeklyTime >= 600 },
    { id: "week_master", name: "Maître de la Semaine", description: "Coder plus de 20h en une semaine", emoji: "🏆", type: 'weekly', condition: (weeklyTime) => weeklyTime >= 1200 },
    { id: "evolution_master", name: "Maître Évolution", description: "Débloquer toutes les évolutions en une semaine", emoji: "🎭", type: 'weekly', condition: (weeklyTime, animals) => animals >= 6 },

    // Consecutive Weeks
    { id: "consistency", name: "Régularité", description: "Compléter 3 semaines consécutives avec au moins 5h", emoji: "📅", type: 'global', condition: (total, weekly, level, context) => context.globalState.get("minipote.consecutiveWeeks", 0) >= 3 },
    
    // Session-based (checked after a coding session)
    { id: "in_the_zone", name: "Dans la Zone", description: "Coder pendant 2 heures sans interruption", emoji: "🧘", type: 'session', condition: (sessionDuration) => sessionDuration >= 120 },

    // Special Conditions
    { id: "early_bird", name: "Lève-tôt", description: "Coder entre 6h et 8h du matin", emoji: "🐦", type: 'global', condition: () => { const h = new Date().getHours(); return h >= 6 && h < 8; } },
    { id: "night_owl", name: "Oiseau de Nuit", description: "Coder entre 22h et 6h du matin", emoji: "🦉", type: 'global', condition: () => { const h = new Date().getHours(); return h >= 22 || h < 6; } },
    { id: "weekend_warrior", name: "Guerrier du Weekend", description: "Coder pendant un Samedi ou un Dimanche", emoji: "🛡️", type: 'global', condition: () => { const d = new Date().getDay(); return d === 0 || d === 6; } },
    { id: "versatile_coder", name: "Codeur Polyvalent", description: 'Débloquer "Lève-tôt" et "Oiseau de Nuit"', emoji: "🌗", type: 'global', condition: (total, weekly, level, context) => { const achs = context.globalState.get("minipote.achievements", []); return achs.includes("early_bird") && achs.includes("night_owl"); } }
];

const PET_MESSAGES = [
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

module.exports = {
    ACHIEVEMENT_DEFINITIONS,
    PET_MESSAGES,
    animalPaths
};