const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('album-info')
        .setDescription('Get information about an album')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('album')
                .setDescription('Name of the album')
                .setRequired(true)
        ),
    async execute(interaction) {
        const artistName = interaction.options.getString('artist');
        const albumName = interaction.options.getString('album');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=album.getInfo&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const album = response.data.album;

            if (!album) {
                await interaction.reply('Album not found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`${album.name} by ${album.artist}`)
                .setURL(album.url)
                .setColor('Random')
                .setDescription(album.wiki ? album.wiki.summary : 'No description available.')
                .setThumbnail(album.image[3]['#text']);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching album info:', error);
            await interaction.reply('Error fetching album info.');
        }
    },
};
