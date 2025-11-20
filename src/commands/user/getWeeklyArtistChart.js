const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-weekly-artist-chart')
        .setDescription('Get the weekly artist chart for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of top artists to display (default is 5)')
                .setRequired(false)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const limit = interaction.options.getInteger('limit') || 5;

        try {
            const params = {
                method: 'user.getWeeklyArtistChart',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: limit,
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.weeklyartistchart || !response.data.weeklyartistchart.artist.length) {
                await interaction.reply('No weekly artist chart found.');
                return;
            }

            const weeklyArtistChart = response.data.weeklyartistchart.artist;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Weekly Artist Chart`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/charts?rangetype=weekly&subtype=artists`)
                .setThumbnail(weeklyArtistChart[0].image[weeklyArtistChart[0].image.length - 1]['#text']);

            weeklyArtistChart.forEach((artist) => {
                embed.addFields({
                    name: artist.name,
                    value: `Playcount: ${artist.playcount}\n[Link to artist](${artist.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching weekly artist chart:', error);
            await interaction.reply('Error fetching weekly artist chart.');
        }
    },
};
