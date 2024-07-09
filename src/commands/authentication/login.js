const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
   data: new SlashCommandBuilder()
       .setName('login')
       .setDescription('Authenticate with Last.fm'),
   async execute(interaction) {
       const discordUserId = interaction.user.id;
      
       // Construct the authentication URL
       const authUrl = `https://api.krishanator.com/auth?user=${discordUserId}`;


       await interaction.reply(`Please authenticate with Last.fm by clicking [here](${authUrl}).`);


       // The actual username and session key will be saved during the callback in server.js
   },
};
