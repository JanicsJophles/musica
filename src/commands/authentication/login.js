const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Authenticate with Last.fm'),
    async execute(interaction) {
        const discordUserId = interaction.user.id;

        // Check if the user is already authenticated
        db.get('SELECT lastFmUsername FROM users WHERE discordUserId = ?', [discordUserId], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                interaction.reply('There was an error checking your authentication status.');
                return;
            }

            if (row) {
                interaction.reply(`You are already logged in as ${row.lastFmUsername}!`);
            } else {
                const url = process.env.URL;
                // Construct the authentication URL
                const authUrl = `${url}auth?user=${discordUserId}`;

                interaction.reply(`Please authenticate with Last.fm by clicking [here](${authUrl}).`);
            }
        });
    },
};
