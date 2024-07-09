const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
module.exports = {
   data: new SlashCommandBuilder()
       .setName('login')
       .setDescription('Authenticate with Last.fm'),
   async execute(interaction) {
       const discordUserId = interaction.user.id;
       const url = process.env.URL;
       // Construct the authentication URL
       const authUrl = `${url}auth?user=${discordUserId}`;


       await interaction.reply(`Please authenticate with Last.fm by clicking [here](${authUrl}).`);


       // The actual username and session key will be saved during the callback in server.js
   },
};
