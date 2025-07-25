const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();
const db = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Authenticate with Last.fm'),
    async execute(interaction) {
        const discordUserId = interaction.user.id;
        const image = "https://images.squarespace-cdn.com/content/v1/5e3cc11ed2bb072570aa443e/1613670108055-7A0ETH4TMY8KV08DAB6D/2013KanyeWest_Yeezus_600G030613-1.jpg";

        // Check if the user is already authenticated
        db.get('SELECT lastFmUsername FROM users WHERE discordUserId = ?', [discordUserId], (err, row) => {
            if (err) {
                console.error('Database error:', err);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Error')
                    .setDescription('There was an error checking your authentication status.')
                    .setTimestamp()
                    .setFooter({ text: 'Last.fm Authentication', iconURL: image });

                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                return;
            }

            if (row) {
                const loggedInEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Already Authenticated')
                    .setDescription(`You are already logged in BUD! as ${row.lastFmUsername}!`)
                    .setTimestamp()
                    .setFooter({ text: 'Last.fm Authentication', iconURL: image });

                interaction.reply({ embeds: [loggedInEmbed], ephemeral: true });
            } else {
                // Construct the base URL properly
                let rawUrl = process.env.URL || '';
                rawUrl = rawUrl.replace(/\/$/, ''); // remove trailing slash if present
                const baseUrl = rawUrl.startsWith('http') ? rawUrl : `http://${rawUrl}`;
                const authUrl = `${baseUrl}/auth?user=${discordUserId}`;

                const authEmbed = new EmbedBuilder()
                    .setColor('#0000FF')
                    .setTitle('Authenticate with Last.fm')
                    .setDescription(`Please authenticate with Last.fm by clicking [here](${authUrl}).`)
                    .setTimestamp()
                    .setFooter({ text: 'Last.fm Authentication', iconURL: image });

                interaction.reply({ embeds: [authEmbed], ephemeral: true });
            }
        });
    },
};
