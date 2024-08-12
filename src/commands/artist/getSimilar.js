const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('similar-artists-from-artist')
        .setDescription('Get similar artists to a specified artist')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist')
                .setRequired(true)
        ),
    async execute(interaction) {
        const artistName = interaction.options.getString('artist');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const similarArtists = response.data.similarartists.artist;

            if (!similarArtists || similarArtists.length === 0) {
                await interaction.reply('No similar artists found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Artists similar to ${artistName}`)
                .setColor('Random')
                .setDescription(similarArtists.map((artist, index) => `${index + 1}. [${artist.name}](https://www.last.fm/music/${encodeURIComponent(artist.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching similar artists:', error);
            await interaction.reply('Error fetching similar artists.');
        }
    },
};