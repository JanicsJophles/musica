const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { resolveLastFmUser } = require('../../utils/userUtils');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Get information about a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up (optional if logged in)')
                .setRequired(false)),
    async execute(interaction) {
        const resolved = await resolveLastFmUser(interaction);
        if (!resolved) return; // Error handled in utility

        const { username, iconURL } = resolved;

        try {
            const params = {
                method: 'user.getInfo',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.user) {
                await interaction.reply('User not found.');
                return;
            }

            const user = response.data.user;

            const embed = new EmbedBuilder()
                .setTitle(`${user.name}'s Last.fm Profile`)
                .setURL(user.url)
                .setThumbnail(user.image[user.image.length - 1]['#text'] || iconURL)
                .addFields(
                    { name: 'Country', value: user.country || 'N/A', inline: true },
                    { name: 'Playcount', value: user.playcount.toString(), inline: true },
                    { name: 'Registered', value: new Date(user.registered.unixtime * 1000).toLocaleDateString(), inline: true }
                )
                .setFooter({ text: `Profile created on ${new Date(user.registered.unixtime * 1000).toLocaleDateString()}`, iconURL: iconURL });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching user info:', error);
            await interaction.reply('Error fetching user information.');
        }
    },
};
