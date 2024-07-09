const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
   data: new SlashCommandBuilder()
       .setName('login')
       .setDescription('Authenticate with Last.fm'),
   async execute(interaction) {
       const discordUserId = interaction.user.id;
      
       // Construct the authentication URL
       const authUrl = `https://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(`${REDIRECT_URI}?user=${discordUserId}`)}`;


       await interaction.reply(`Please authenticate with Last.fm by clicking [here](${authUrl}).`);


       // The actual username and session key will be saved during the callback in server.js
   },
};
