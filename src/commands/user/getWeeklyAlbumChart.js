const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { resolveLastFmUser } = require('../../utils/userUtils');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-weekly-album-chart')
        .setDescription('Get the weekly album chart for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up (optional if logged in)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of top albums to display (default is 5)')
                .setRequired(false)),
    async execute(interaction) {
        const resolved = await resolveLastFmUser(interaction);
        if (!resolved) return;

        const { username, iconURL } = resolved;
        const limit = interaction.options.getInteger('limit') || 5;

        try {
            const params = {
                method: 'user.getWeeklyAlbumChart',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
                limit: limit,
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.weeklyalbumchart || !response.data.weeklyalbumchart.album.length) {
                await interaction.reply('No weekly album chart found.');
                return;
            }

            const weeklyAlbumChart = response.data.weeklyalbumchart.album;

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Weekly Album Chart`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/charts?rangetype=weekly&subtype=albums`)
                .setFooter({ text: 'Last.fm Weekly Album Chart', iconURL: iconURL });
            
            if (weeklyAlbumChart[0].image && weeklyAlbumChart[0].image.length > 0) {
                 embed.setThumbnail(weeklyAlbumChart[0].image[weeklyAlbumChart[0].image.length - 1]['#text']);
            } else {
                 embed.setThumbnail(iconURL);
            }

            weeklyAlbumChart.forEach((album) => {
                embed.addFields({
                    name: album.name,
                    value: `Artist: ${album.artist['#text']}\nPlaycount: ${album.playcount}\n[Link to album](${album.url})`,
                    inline: true
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching weekly album chart:', error);
            await interaction.reply('Error fetching weekly album chart.');
        }
    },
};
