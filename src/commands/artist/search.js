const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search-artist')
        .setDescription('Search for an artist by name')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist to search')
                .setRequired(true)
        ),
    async execute(interaction) {
        const artistName = interaction.options.getString('artist');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const artists = response.data.results.artistmatches.artist;

            if (!artists || artists.length === 0) {
                await interaction.reply('No artists found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Search Results for "${artistName}"`)
                .setColor('Random')
                .setDescription(artists.map((artist, index) => `${index + 1}. [${artist.name}](https://www.last.fm/music/${encodeURIComponent(artist.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error searching for artist:', error);
            await interaction.reply('Error searching for artist.');
        }
    },
};
