const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-weekly-chart-list')
        .setDescription('Get the weekly chart list for a Last.fm user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Last.fm username to look up')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('username');

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

            const embed = new EmbedBuilder()
                .setTitle(`${username}'s Weekly Chart List`)
                .setDescription(`Here are the available weekly charts for ${username}`)
                .setURL(`https://www.last.fm/user/${encodeURIComponent(username)}/charts`)
                .setColor('Random');

            weeklyChartList.forEach((chart) => {
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
