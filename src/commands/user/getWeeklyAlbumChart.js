const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-weekly-album-chart')
        .setDescription('Get the weekly album chart for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of top albums to display (default is 5)')
                .setRequired(false)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const limit = interaction.options.getInteger('limit') || 5;

        try {
            const params = {
                method: 'user.getWeeklyAlbumChart',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: limit,
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.weeklyalbumchart || !response.data.weeklyalbumchart.album.length) {
                await interaction.reply('No weekly album chart found.');
                return;
            }

            const weeklyAlbumChart = response.data.weeklyalbumchart.album;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Weekly Album Chart`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/charts?rangetype=weekly&subtype=albums`)
                .setThumbnail(weeklyAlbumChart[0].image[weeklyAlbumChart[0].image.length - 1]['#text']);

            weeklyAlbumChart.forEach((album) => {
                embed.addFields({
                    name: album.name,
                    value: `Artist: ${album.artist.name}\nPlaycount: ${album.playcount}\n[Link to album](${album.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching weekly album chart:', error);
            await interaction.reply('Error fetching weekly album chart.');
        }
    },
};
