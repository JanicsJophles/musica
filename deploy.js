const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [];

const readCommands = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            readCommands(path.join(dir, file.name));
        } else if (file.name.endsWith('.js')) {
            const filePath = path.join(dir, file.name);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
    }
};

// Read all command files from src/commands
readCommands(path.join(__dirname, 'src', 'commands'));

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing global application (/) commands.');

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log('Successfully reloaded global application (/) commands.');
    } catch (error) {
        console.error('Error refreshing global commands:', error);
    }
})();