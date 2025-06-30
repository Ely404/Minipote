# Mini Pote - Ton Compagnon de Code 🐲

[![Licence](https://img.shields.io/github/license/Ely404/minipote?style=for-the-badge)](LICENSE)

Un compagnon de code virtuel pour VS Code qui évolue en fonction du temps que tu passes à coder. Reste motivé, débloque des succès et regarde ton Mini Pote grandir avec tes compétences !

---

## ✨ Fonctionnalités

- **🐾 Compagnon Évolutif :** Ton Pote évolue à travers différents stades en fonction de ton temps de codage hebdomadaire.
- **📈 Niveaux et XP :** Gagne de l'expérience et monte de niveau en fonction de ton temps de codage total. Ton niveau est permanent !
- **🏆 Système de Succès :** Débloque des dizaines de succès pour tes accomplissements, qu'il s'agisse de coder la nuit ou de maintenir une régularité sur plusieurs semaines.
- **🎲 Chemins d'Évolution Multiples :** Découvre plusieurs chemins d'évolution (Dragon, Licorne, Robot...) pour renouveler l'expérience chaque semaine.
- **📊 Statistiques Détaillées :** Suis ton temps de codage total et hebdomadaire directement dans la vue de l'extension.
- **🇫🇷 Entièrement en Français.**

---

## 🚀 Installation et Utilisation

Cette extension n'est pas sur le VS Code Marketplace. L'installation se fait manuellement via un fichier `.vsix`.

### **1. Pour les Utilisateurs**

Pour installer Mini Pote, suivez ces étapes :

1.  **📦 Télécharger le fichier :**

    - Téléchargez le fichier le plus récent qui se termine par `.vsix` (par exemple `minipote-1.0.0.vsix`).

2.  **💻 Installer dans VS Code :**

    - Ouvrez Visual Studio Code.
    - Allez dans l'onglet **Extensions** dans la barre de gauche (l'icône des carrés).
    - Cliquez sur les trois points (`...`) en haut à droite de la vue Extensions.
    - Sélectionnez **"Install from VSIX..."**.
    - Choisissez le fichier `.vsix` que vous venez de télécharger.

3.  **🎉 Profiter :**
    - L'extension sera installée et prête à l'emploi ! Cliquez sur la nouvelle icône Mini Pote dans votre barre d'activité.

---

### **2. Pour les Développeurs**

Si vous avez modifié le code et que vous voulez créer votre propre fichier `.vsix` :

1.  **Prérequis :** Assurez-vous d'avoir Node.js installé. Ensuite, installez l'outil de packaging de VS Code (`vsce`) globalement sur votre machine :

    ```bash
    npm install -g vsce
    ```

2.  **Créer le paquet :** Ouvrez un terminal à la racine du projet et lancez la commande suivante :

    ```bash
    vsce package
    ```

3.  **Résultat :** Cette commande va créer un fichier `minipote-x.y.z.vsix` dans le dossier du projet (où `x.y.z` est la version définie dans `package.json`). C'est ce fichier que vous pouvez partager avec vos amis !

---

## 🧠 Concepts Clés

### L'Évolution (Hebdomadaire)

L'apparence de ton Mini Pote est basée sur le temps que tu as passé à coder **cette semaine**. Il existe 6 stades d'évolution, du stade 0 (Œuf) au stade 5 (Forme Cosmique). Le reset a lieu chaque lundi matin.

### Le Niveau Global (Permanent)

Ton niveau global reflète ton investissement sur le long terme (**1 heure de codage = 1 niveau**). Ce niveau n'est **jamais** réinitialisé.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Si tu as des idées d'améliorations, n'hésite pas à ouvrir une **Pull Request**.

1.  **Fork** le projet.
2.  Crée une nouvelle branche (`git checkout -b feature/nouvelle-fonctionnalite`).
3.  **Commit** tes changements (`git commit -m 'Ajout de...'`).
4.  **Push** vers ta branche (`git push origin feature/nouvelle-fonctionnalite`).
5.  Ouvre une **Pull Request**.

---

## 📜 Licence

Ce projet est distribué sous la licence MIT. Voir le fichier `LICENSE` pour plus de détails.

**Bon codage !** ❤️
