const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('global-top-artists')
        .setDescription('Shows the top global artists'),
    async execute(interaction) {
        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=chart.getTopArtists&api_key=${LASTFM_API_KEY}&format=json`);
            const topArtists = response.data.artists.artist;

            if (!topArtists || topArtists.length === 0) {
                await interaction.reply('No top artists found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('Top Global Artists')
                .setColor('Random')
                .setDescription(topArtists.map((artist, index) => `${index + 1}. [${artist.name}](https://www.last.fm/music/${encodeURIComponent(artist.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top artists:', error);
            await interaction.reply('Error fetching top artists.');
        }
    },
};
