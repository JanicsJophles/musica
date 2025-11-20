const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search-album')
        .setDescription('Search for an album by name')
        .addStringOption(option =>
            option.setName('album')
                .setDescription('Name of the album to search')
                .setRequired(true)
        ),
    async execute(interaction) {
        const albumName = interaction.options.getString('album');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(albumName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const albums = response.data.results.albummatches.album;

            if (!albums || albums.length === 0) {
                await interaction.reply('No albums found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Search Results for "${albumName}"`)
                .setColor('Random')
                .setDescription(albums.map((album, index) => `${index + 1}. [${album.name} by ${album.artist}](https://www.last.fm/music/${encodeURIComponent(album.artist)}/_/${encodeURIComponent(album.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error searching for albums:', error);
            await interaction.reply('Error searching for albums.');
        }
    },
};
