const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Load environment variables from .env file

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started deleting global (/) commands.');

        // Fetch all existing global commands
        const commands = await rest.get(
            Routes.applicationCommands(clientId)
        );

        // Delete each global command
        await Promise.all(commands.map(command =>
            rest.delete(Routes.applicationCommand(clientId, command.id))
                .then(() => console.log(`Deleted command ${command.name} with ID ${command.id}`))
                .catch(error => console.error(`Failed to delete command ${command.name} with ID ${command.id}:`, error))
        ));

        console.log('Successfully deleted all global application (/) commands.');
    } catch (error) {
        console.error('Error occurred while deleting global application (/) commands:', error);
    }
})();
