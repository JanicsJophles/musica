const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file


const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;


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


readCommands(path.join(__dirname, 'commands'));


const rest = new REST({ version: '10' }).setToken(token);


(async () => {
   try {
       console.log('Started refreshing application (/) commands.');


       await rest.put(
           Routes.applicationGuildCommands(clientId, guildId),
           { body: commands },
       );


       console.log('Successfully reloaded application (/) commands.');
   } catch (error) {
       console.error(error);
   }
})();
