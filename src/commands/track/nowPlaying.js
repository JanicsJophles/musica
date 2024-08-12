const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const db = require('../../database');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const DEFAULT_ICON_URL = 'https://images.squarespace-cdn.com/content/v1/5e3cc11ed2bb072570aa443e/1613670108055-7A0ETH4TMY8KV08DAB6D/2013KanyeWest_Yeezus_600G030613-1.jpg';

// Function to retrieve user data from database
async function getUserData(discordUserId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE discordUserId = ?`, [discordUserId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('now-playing')
        .setDescription('Shows what you are currently listening to on Last.fm')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('Discord user or Last.fm username to look up')
        ),
    async execute(interaction) {
        const discordUserId = interaction.user.id;
        const userOption = interaction.options.getString('user');

        let userData;
        let targetUser;
        let iconURL = DEFAULT_ICON_URL;

        // Check if user option is provided
        if (userOption) {
            // Check if userOption is a Discord mention or Last.fm username
            const mentionRegex = /^<@!?(\d+)>$/;
            const isMention = mentionRegex.test(userOption);
            
            if (isMention) {
                const userId = userOption.match(mentionRegex)[1];
                targetUser = interaction.guild.members.cache.get(userId);

                if (!targetUser) {
                    await interaction.reply('User not found in this server.');
                    return;
                }

                userData = await getUserData(userId);

                if (!userData) {
                    const embed = new EmbedBuilder()
                        .setTitle('Authentication Required')
                        .setDescription(`User ${targetUser.user.username} is not authenticated. Authenticate using /login first.`);
                    await interaction.reply({ embeds: [embed] });
                    return;
                }

                iconURL = targetUser.user.avatarURL() || DEFAULT_ICON_URL;
            } else {
                // Assume userOption is a Last.fm username
                try {
                    const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getInfo&user=${encodeURIComponent(userOption)}&api_key=${LASTFM_API_KEY}&format=json`);
                    const { user } = response.data;

                    if (!user) {
                        const embed = new EmbedBuilder()
                            .setTitle('User Not Found')
                            .setDescription(`Last.fm user "${userOption}" not found. Check the username and try again.`);
                        await interaction.reply({ embeds: [embed] });
                        return;
                    }

                    // Use the Last.fm username for API request
                    userData = await getUserData(discordUserId);
                    targetUser = { username: user.name }; // Use Last.fm username directly
                } catch (error) {
                    console.error('Error fetching Last.fm user:', error);
                    await interaction.reply('Error fetching Last.fm user data.');
                    return;
                }

                iconURL = DEFAULT_ICON_URL; // Set default image URL for Last.fm usernames
            }
        } else {
            // No user option provided, use the current user
            userData = await getUserData(discordUserId);
            targetUser = interaction.user;
            iconURL = targetUser.avatarURL() || DEFAULT_ICON_URL;
        }

        try {
            const params = {
                method: 'user.getRecentTracks',
                user: userData.lastFmUsername,
                api_key: LASTFM_API_KEY,
                limit: 1,
                format: 'json',
            };

            // URL-encode parameters
            const encodedParams = new URLSearchParams(params);

            const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?${encodedParams}`);
            const track = response.data.recenttracks.track[0];

            if (!track) {
                await interaction.reply('No recent tracks found.');
                return;
            }

            const { artist, name, album, date } = track;
            const scrobblesResponse = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getInfo&user=${userData.lastFmUsername}&api_key=${LASTFM_API_KEY}&format=json`);
            const userPlayInfo = scrobblesResponse.data.user;
            const scrobbles = userPlayInfo.playcount;

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: targetUser.username === interaction.user.username ? `${targetUser.username}'s current track` : `Last track for ${targetUser.username}`,
                    iconURL: iconURL
                })
                .setTitle(name)
                .setColor('Random')
                .setURL(`https://www.last.fm/music/${encodeURIComponent(artist['#text'])}/_/${encodeURIComponent(name)}`)
                .setDescription(`${artist['#text']} | ${album['#text']}`)
                .setFooter({ text: `Total scrobbles: ${scrobbles}${track['@attr'] && track['@attr'].nowplaying ? ' | Currently Playing' : ` | Last scrobbled at: ${new Date(date.uts * 1000).toLocaleString()}`}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching current track:', error);
            await interaction.reply('Error fetching current track.');
        }
    },
};
