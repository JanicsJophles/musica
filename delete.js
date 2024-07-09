const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Load environment variables from .env file


const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;


const rest = new REST({ version: '10' }).setToken(token);


(async () => {
   try {
       console.log('Started deleting application (/) commands.');


       const commands = await rest.get(
           Routes.applicationGuildCommands(clientId, guildId)
       );


       for (const command of commands) {
           await rest.delete(
               `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`
           );
           console.log(`Deleted command ${command.name} with ID ${command.id}`);
       }


       console.log('Successfully deleted all application (/) commands.');
   } catch (error) {
       console.error(error);
   }
})();
