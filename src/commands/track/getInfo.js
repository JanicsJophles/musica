const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { resolveLastFmUser } = require('../../utils/userUtils');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track-info')
        .setDescription('Get detailed information about a specific track on Last.fm')
        .addStringOption(option =>
            option.setName('track')
                .setDescription('Name of the track to look up')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of the artist of the track')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Check playcount for specific user (optional)')
                .setRequired(false)),
    async execute(interaction) {
        const trackName = interaction.options.getString('track');
        const artistName = interaction.options.getString('artist');
        
        // Try to resolve user, but don't error if not found/auth
        const resolved = await resolveLastFmUser(interaction, false);
        const username = resolved ? resolved.username : null;

        try {
            const params = {
                method: 'track.getInfo',
                track: trackName,
                artist: artistName,
                api_key: LASTFM_API_KEY,
                format: 'json',
            };

            if (username) {
                params.username = username;
            }

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.track) {
                await interaction.reply('Track not found.');
                return;
            }

            const track = response.data.track;
            const album = track.album ? track.album.title : 'Unknown Album';
            const userPlayCount = track.userplaycount !== undefined ? track.userplaycount : 'N/A';

            const embed = new EmbedBuilder()
                .setTitle(track.name)
                .setDescription(`${track.artist.name} | ${album}`)
                .setURL(track.url)
                .addFields(
                    { name: 'Listeners', value: track.listeners || '0', inline: true },
                    { name: 'Playcount', value: track.playcount || '0', inline: true }
                )
                .setFooter({ text: `Track information provided by Last.fm` });

            if (username) {
                embed.addFields({ name: `${username}'s Playcount`, value: userPlayCount.toString(), inline: true });
            }

            if (track.album && track.album.image && track.album.image.length > 0) {
                 embed.setThumbnail(track.album.image[track.album.image.length - 1]['#text']);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching track info:', error);
            await interaction.reply('Error fetching track information.');
        }
    },
};
