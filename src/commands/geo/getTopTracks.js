const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('country-top-tracks')
        .setDescription('Shows the top tracks for a specified country')
        .addStringOption(option =>
            option.setName('country')
                .setDescription('Country to look up')
                .setRequired(true)
        ),
    async execute(interaction) {
        const country = interaction.options.getString('country');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=geo.getTopTracks&country=${encodeURIComponent(country)}&api_key=${LASTFM_API_KEY}&format=json`);
            const topTracks = response.data.tracks.track;

            if (!topTracks || topTracks.length === 0) {
                await interaction.reply('No top tracks found for this country.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Top Tracks in ${country}`)
                .setColor('Random')
                .setDescription(topTracks.map((track, index) => `${index + 1}. [${track.name}](https://www.last.fm/music/${encodeURIComponent(track.artist.name)}/_/${encodeURIComponent(track.name)}) by ${track.artist.name}`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top tracks:', error);
            await interaction.reply('Error fetching top tracks.');
        }
    },
};
