const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artist-info')
        .setDescription('Get information about an artist')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist')
                .setRequired(true)
        ),
    async execute(interaction) {
        const artistName = interaction.options.getString('artist');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(artistName)}&api_key=${LASTFM_API_KEY}&format=json`);
            const artist = response.data.artist;

            if (!artist) {
                await interaction.reply('Artist not found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(artist.name)
                .setURL(artist.url)
                .setColor('Random')
                .setDescription(artist.bio ? artist.bio.summary : 'No biography available.');

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching artist info:', error);
            await interaction.reply('Error fetching artist info.');
        }
    },
};
