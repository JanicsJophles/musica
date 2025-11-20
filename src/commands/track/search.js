const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track-search')
        .setDescription('Search for a track on Last.fm')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The name of the track to search for')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');

        try {
            const params = {
                method: 'track.search',
                track: query,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: 5, // Limit to top 5 results
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.results.trackmatches.track.length) {
                await interaction.reply('No tracks found.');
                return;
            }

            const tracks = response.data.results.trackmatches.track;

            const embed = new EmbedBuilder()
                .setTitle(`Search results for "${query}"`);

            tracks.forEach((track) => {
                embed.addFields({ name: track.name, value: `Artist: ${track.artist}\n[Link to track](${track.url})`, inline: true });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error searching for tracks:', error);
            await interaction.reply('Error searching for tracks.');
        }
    },
};
