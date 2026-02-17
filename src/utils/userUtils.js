const db = require('../database');
const axios = require('axios');
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

/**
 * Resolves the Last.fm user from interaction options or database.
 * If user logic fails or user is not found, this function handles the reply and returns null.
 * @param {Interaction} interaction
 * @param {boolean} [requireAuth=true] - Whether to require authentication/user resolution. If false, returns null username without replying error if not found.
 * @returns {Promise<{username: string|null, discordUser: Object, iconURL: string} | null>}
 */
async function resolveLastFmUser(interaction, requireAuth = true) {
    const discordUserId = interaction.user.id;
    // Check for "user" or "username" option to be compatible with both styles
    const userOption = interaction.options.getString('user') || interaction.options.getString('username');

    let userData;
    let targetUser;
    let iconURL = DEFAULT_ICON_URL;

    // Check if user option is provided
    if (userOption) {
        // ... (existing logic for options remains same, assuming if option provided, user expects it to work)
        // Check if userOption is a Discord mention or Last.fm username
        const mentionRegex = /^<@!?(\d+)>$/;
        const isMention = mentionRegex.test(userOption);
        
        if (isMention) {
            const userId = userOption.match(mentionRegex)[1];
            targetUser = interaction.guild.members.cache.get(userId);

            if (!targetUser) {
                await interaction.reply({ content: 'User not found in this server.', ephemeral: true });
                return null;
            }

            try {
                userData = await getUserData(userId);
            } catch (err) {
                console.error('Database error:', err);
                await interaction.reply({ content: 'Database error.', ephemeral: true });
                return null;
            }

            if (!userData) {
                const embed = new EmbedBuilder()
                    .setTitle('Authentication Required')
                    .setDescription(`User ${targetUser.user.username} is not authenticated. Authenticate using /login first.`)
                    .setColor('Red');
                await interaction.reply({ embeds: [embed] });
                return null;
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
                        .setDescription(`Last.fm user "${userOption}" not found. Check the username and try again.`)
                        .setColor('Red');
                    await interaction.reply({ embeds: [embed] });
                    return null;
                }

                userData = { lastFmUsername: user.name };
                targetUser = { username: user.name };
            } catch (error) {
                if (error.response && error.response.status === 404) {
                     const embed = new EmbedBuilder()
                        .setTitle('User Not Found')
                        .setDescription(`Last.fm user "${userOption}" not found.`)
                        .setColor('Red');
                    await interaction.reply({ embeds: [embed] });
                    return null;
                }
                console.error('Error fetching Last.fm user:', error);
                await interaction.reply({ content: 'Error fetching Last.fm user data.', ephemeral: true });
                return null;
            }

            iconURL = DEFAULT_ICON_URL;
        }
    } else {
        // No user option provided, use the current user
        try {
            userData = await getUserData(discordUserId);
        } catch (err) {
            console.error('Database error:', err);
             await interaction.reply({ content: 'Database error.', ephemeral: true });
             return null;
        }

        if (!userData) {
            if (requireAuth) {
                 const embed = new EmbedBuilder()
                    .setTitle('Authentication Required')
                    .setDescription('You are not authenticated. Please use `/login` to link your Last.fm account.')
                    .setColor('Red');
                await interaction.reply({ embeds: [embed] });
                return null;
            } else {
                // Not required, just return null username
                return { username: null, discordUser: interaction.user, iconURL: interaction.user.avatarURL() || DEFAULT_ICON_URL };
            }
        }

        targetUser = interaction.user;
        iconURL = targetUser.avatarURL() || DEFAULT_ICON_URL;
    }

    return {
        username: userData.lastFmUsername,
        discordUser: targetUser,
        iconURL: iconURL
    };
}

module.exports = { resolveLastFmUser };
