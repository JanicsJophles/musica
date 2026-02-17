const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { resolveLastFmUser } = require('../../utils/userUtils');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-weekly-chart-list')
        .setDescription('Get the weekly chart list for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up (optional if logged in)')
                .setRequired(false))
         .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Number of recent weeks to display (default is 10)')
                .setRequired(false)),
    async execute(interaction) {
        const resolved = await resolveLastFmUser(interaction);
        if (!resolved) return;

        const { username, iconURL } = resolved;
        const limit = interaction.options.getInteger('limit') || 10;

        try {
            const params = {
                method: 'user.getWeeklyChartList',
                user: username,
                api_key: LASTFM_API_KEY,
                format: 'json',
            };

            const response = await axios.get('https://ws.audioscrobbler.com/2.0/', { params });

            if (!response.data.weeklychartlist || !response.data.weeklychartlist.chart.length) {
                await interaction.reply('No weekly chart list found.');
                return;
            }

            const weeklyChartList = response.data.weeklychartlist.chart;
            // Get the last N weeks
            const recentWeeks = weeklyChartList.slice(-limit).reverse();

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Weekly Chart List`)
                .setDescription(`Here are the last ${recentWeeks.length} weekly charts for ${username}`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/charts`)
                .setColor('Random')
                .setFooter({ text: 'Last.fm Weekly Chart List', iconURL: iconURL });

            recentWeeks.forEach((chart) => {
                embed.addFields({
                    name: `From ${new Date(chart.from * 1000).toLocaleDateString()} to ${new Date(chart.to * 1000).toLocaleDateString()}`,
                    value: `Chart range: ${chart.from} - ${chart.to}`,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching weekly chart list:', error);
            await interaction.reply('Error fetching weekly chart list.');
        }
    },
};
