const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-top-tracks')
        .setDescription('Get the top tracks for a Last.fm user')
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
                method: 'user.getTopTracks',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: limit,
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.toptracks || !response.data.toptracks.track.length) {
                await interaction.reply('No top tracks found.');
                return;
            }

            const topTracks = response.data.toptracks.track;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Top Tracks`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/library/tracks`)
                .setThumbnail(topTracks[0].image[topTracks[0].image.length - 1]['#text']);

            topTracks.forEach((track) => {
                embed.addFields({
                    name: track.name,
                    value: `Artist: ${track.artist.name}\nPlaycount: ${track.playcount}\n[Link to track](${track.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            await interaction.reply('Error fetching top tracks.');
        }
    },
};
