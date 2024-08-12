const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-loved-tracks')
        .setDescription('Get a list of loved tracks for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');

        try {
            const params = {
                method: 'user.getLovedTracks',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: 5, // Limit to top 5 loved tracks
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.lovedtracks || !response.data.lovedtracks.track.length) {
                await interaction.reply('No loved tracks found.');
                return;
            }

            const lovedTracks = response.data.lovedtracks.track;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Loved Tracks`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/loved`)
                .setThumbnail(lovedTracks[0].image[lovedTracks[0].image.length - 1]['#text']);

            lovedTracks.forEach((track) => {
                embed.addFields({
                    name: track.name,
                    value: `Artist: ${track.artist.name}\n[Link to track](${track.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching loved tracks:', error);
            await interaction.reply('Error fetching loved tracks.');
        }
    },
};
