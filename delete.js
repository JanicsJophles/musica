const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Load environment variables from .env file

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started deleting application (/) commands.');

        // Fetch all existing commands for the guild
        const commands = await rest.get(
            Routes.applicationCommands(clientId)
        );

        // Delete each command concurrently
        await Promise.all(commands.map(command => 
            rest.delete(`${Routes.applicationCommands(clientId)}/${command.id}`)
                .then(() => console.log(`Deleted command ${command.name} with ID ${command.id}`))
                .catch(error => console.error(`Failed to delete command ${command.name} with ID ${command.id}:`, error))
        ));

        console.log('Successfully deleted all application (/) commands.');
    } catch (error) {
        console.error('Error occurred while deleting application (/) commands:', error);
    }
})();
