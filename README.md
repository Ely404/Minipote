Mini Pote - Your Code Companion 🐲

![License](https://img.shields.io/github/license/Ely404/minipote?style=for-the-badge)

A virtual code companion for VS Code that evolves based on the time you spend coding. Stay motivated, unlock achievements, and watch your Mini Pote grow with your skills !
✨ Features

    🐾 Evolving Companion: Your Pote evolves through different stages based on your weekly coding time.
    📈 Levels and XP: Gain experience and level up based on your total coding time. Your level is permanent !
    🏆 Achievement System: Unlock dozens of achievements for your accomplishments, whether it's coding at night or maintaining a streak over several weeks.
    🎲 Multiple Evolution Paths: Discover several evolution paths (Dragon, Unicorn, Robot...) to refresh the experience each week.
    📊 Detailed Statistics: Track your total and weekly coding time directly in the extension's view.
    🇫🇷 Fully in French.

🚀 Installation and Usage

This extension is not on the VS Code Marketplace. Installation is done manually via a .vsix file.

1. For Users

To install Mini Pote, follow these steps :

📦 Download the file :
Download the latest file that ends with .vsix (e.g., minipote-1.0.0.vsix).

💻 Install in VS Code :
Open Visual Studio Code.
Go to the Extensions tab in the left sidebar (the squares icon).
Click on the three dots (...) at the top right of the Extensions view.
Select "Install from VSIX...".
Choose the .vsix file you just downloaded.

🎉 Enjoy :
The extension will be installed and ready to use ! Click on the new Mini Pote icon in your activity bar.

2. For Developers

If you have modified the code and want to create your own .vsix file:

Prerequisites: Make sure you have Node.js installed. Then, install the VS Code packaging tool (vsce) globally on your machine :

    npm install -g vsce

Create the package: Open a terminal at the root of the project and run the following command :

    vsce package

Result: This command will create a minipote-x.y.z.vsix file in the project folder (where x.y.z is the version defined in package.json). This is the file you can share with your friends !

🧠 Key Concepts
Evolution (Weekly)

Your Mini Pote's appearance is based on the time you've spent coding this week. There are 6 evolution stages, from stage 0 (Egg) to stage 5 (Cosmic Form). The reset happens every Monday morning.
The Global Level (Permanent)

Your global level reflects your long-term investment (1 hour of coding = 1 level). This level is never reset.
🤝 Contributing

Contributions are welcome ! If you have ideas for improvements, feel free to open a Pull Request.

Fork the project.
Create a new branch (git checkout -b feature/new-feature).
Commit your changes (git commit -m 'Add...').
Push to your branch (git push origin feature/new-feature).
Open a Pull Request.

📜 License

This project is distributed under the MIT License. See the LICENSE file for more details.

Happy coding ! ❤️
