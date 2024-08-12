const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-top-albums')
        .setDescription('Get the top albums for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of top albums to display (default is 5)')
                .setRequired(false)),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const limit = interaction.options.getInteger('limit') || 5;

        try {
            const params = {
                method: 'user.getTopAlbums',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: limit,
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.topalbums || !response.data.topalbums.album.length) {
                await interaction.reply('No top albums found.');
                return;
            }

            const topAlbums = response.data.topalbums.album;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Top Albums`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/library/albums`)
                .setThumbnail(topAlbums[0].image[topAlbums[0].image.length - 1]['#text']);

            topAlbums.forEach((album) => {
                embed.addFields({
                    name: album.name,
                    value: `Artist: ${album.artist.name}\nPlaycount: ${album.playcount}\n[Link to album](${album.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching top albums:', error);
            await interaction.reply('Error fetching top albums.');
        }
    },
};
