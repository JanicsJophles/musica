const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('similar-songs')
        .setDescription('Get a list of tracks similar to a specific track on Last.fm')
        .addStringOption(option =>
            option.setName('track')
                .setDescription('Name of the track to look up')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist of the track')
                .setRequired(true)),
    async execute(interaction) {
        const trackName = interaction.options.getString('track');
        const artistName = interaction.options.getString('artist');

        try {
            const params = {
                method: 'track.getSimilar',
                track: trackName,
                artist: artistName,
                api_key: LASTFM_API_KEY,
                format: 'json',
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.similartracks || !response.data.similartracks.track.length) {
                await interaction.reply('No similar tracks found.');
                return;
            }

            const similarTracks = response.data.similartracks.track.slice(0, 5); // Get top 5 similar tracks
            const embed = new EmbedBuilder()
                .setTitle(`Tracks similar to "${trackName}" by ${artistName}`)
                .setURL(`https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`);

            similarTracks.forEach((track) => {
                embed.addFields({ name: track.name, value: `Artist: ${track.artist.name}`, inline: true });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching similar tracks:', error);
            await interaction.reply('Error fetching similar tracks.');
        }
    },
};
