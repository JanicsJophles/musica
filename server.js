const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require('./src/database'); // Make sure to import your database module
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Authenticate with Last.fm'),
    async execute(interaction) {
        const discordUserId = interaction.user.id;

        // Check if the user is already authenticated
        db.get('SELECT lastFmSessionKey FROM users WHERE discordUserId = ?', [discordUserId], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                interaction.reply('An error occurred while checking authentication status.');
                return;
            }

            if (row && row.lastFmSessionKey) {
                interaction.reply('You are already logged in!');
            } else {
                const url = process.env.URL;
                const authUrl = `${url}auth?user=${discordUserId}`;
                interaction.reply(`Please authenticate with Last.fm by clicking [here](${authUrl}).`);
            }
        });
    },
};
