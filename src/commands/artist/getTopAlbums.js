const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artist-top-albums')
        .setDescription('Get the top albums of an artist')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist')
                .setRequired(true)
        ),
    async execute(interaction) {
        const artistName = interaction.options.getString('artist');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const topAlbums = response.data.topalbums.album;

            if (!topAlbums || topAlbums.length === 0) {
                await interaction.reply('No top albums found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Top Albums by ${artistName}`)
                .setColor('Random')
                .setDescription(topAlbums.map((album, index) => `${index + 1}. [${album.name}](https://www.last.fm/music/${encodeURIComponent(album.artist.name)}/_/${encodeURIComponent(album.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top albums:', error);
            await interaction.reply('Error fetching top albums.');
        }
    },
};
