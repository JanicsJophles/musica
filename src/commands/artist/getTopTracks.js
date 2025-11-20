const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artist-top-tracks')
        .setDescription('Get the top tracks of an artist')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist')
                .setRequired(true)
        ),
    async execute(interaction) {
        const artistName = interaction.options.getString('artist');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const topTracks = response.data.toptracks.track;

            if (!topTracks || topTracks.length === 0) {
                await interaction.reply('No top tracks found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Top Tracks by ${artistName}`)
                .setColor('Random')
                .setDescription(topTracks.map((track, index) => `${index + 1}. [${track.name}](https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(track.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            await interaction.reply('Error fetching top tracks.');
        }
    },
};
