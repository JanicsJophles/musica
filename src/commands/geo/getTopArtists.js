const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('country-top-artists')
        .setDescription('Shows the top artists for a specified country')
        .addStringOption(option =>
            option.setName('country')
                .setDescription('Country to look up')
                .setRequired(true)
        ),
    async execute(interaction) {
        const country = interaction.options.getString('country');

        try {
            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=geo.getTopArtists&country=${encodeURIComponent(country)}&api_key=${LASTFM_API_KEY}&format=json`);
            const topArtists = response.data.topartists.artist;

            if (!topArtists || topArtists.length === 0) {
                await interaction.reply('No top artists found for this country.');
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Top Artists in ${country}`)
                .setColor('Random')
                .setDescription(topArtists.map((artist, index) => `${index + 1}. [${artist.name}](https://www.last.fm/music/${encodeURIComponent(artist.name)})`).join('\n'));

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top artists:', error);
            await interaction.reply('Error fetching top artists.');
        }
    },
};
