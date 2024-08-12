const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();


module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-weekly-track-chart')
        .setDescription('Get the weekly track chart for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of top tracks to display (default is 5)')
                .setRequired(false)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const limit = interaction.options.getInteger('limit') || 5;

        try {
            const params = {
                method: 'user.getWeeklyTrackChart',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: limit,
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.weeklytrackchart || !response.data.weeklytrackchart.track.length) {
                await interaction.reply('No weekly track chart found.');
                return;
            }

            const weeklyTrackChart = response.data.weeklytrackchart.track;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Weekly Track Chart`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/charts?rangetype=weekly&subtype=tracks`)
                .setThumbnail(weeklyTrackChart[0].image[weeklyTrackChart[0].image.length - 1]['#text']);

            weeklyTrackChart.forEach((track) => {
                embed.addFields({
                    name: track.name,
                    value: `Artist: ${track.artist.name}\nPlaycount: ${track.playcount}\n[Link to track](${track.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching weekly track chart:', error);
            await interaction.reply('Error fetching weekly track chart.');
        }
    },
};
