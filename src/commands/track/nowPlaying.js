const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const db = require('../../database');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();


const LASTFM_API_KEY = process.env.LASTFM_API_KEY;


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
       .setName('nowplaying')
       .setDescription('Shows what you are currently listening to on Last.fm'),
   async execute(interaction) {
       const discordUserId = interaction.user.id;


       try {
           const userData = await getUserData(discordUserId);


           if (!userData) {
               await interaction.reply('You need to authenticate first using /login.');
               return;
           }


           const params = {
               method: 'user.getRecentTracks',
               user: userData.lastFmUsername,
               api_key: LASTFM_API_KEY,
               limit: 1,
               format: 'json',
           };


           console.log('Params for request:', params); // Debug: Show params before making request


           // URL-encode parameters
           const encodedParams = new URLSearchParams(params);


           const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?${encodedParams}`);
           const track = response.data.recenttracks.track[0];


           if (track && track['@attr'] && track['@attr'].nowplaying) {
               const { artist, name, album, url } = track;
               const scrobblesResponse = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getInfo&user=${userData.lastFmUsername}&api_key=${LASTFM_API_KEY}&format=json`);
               const userPlayInfo = scrobblesResponse.data.user;
               const scrobbles = userPlayInfo.playcount;


               const embed = new EmbedBuilder()
                   .setAuthor({ name: `${userData.lastFmUsername} is currently listening to...`, iconURL: interaction.user.avatarURL() })
                   .setTitle(name)
                   .setColor('Random')
                   .setURL(`https://www.last.fm/music/${encodeURIComponent(artist['#text'])}/_/${encodeURIComponent(name)}`)
                   .setDescription(`${artist['#text']} | ${album['#text']}`)
                   .setFooter({ text: `Total scrobbles: ${scrobbles} | Currently Playing` });


               await interaction.reply({ embeds: [embed] });
           } else {
               const { artist, name, album, date } = track;
               const scrobblesResponse = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getInfo&user=${userData.lastFmUsername}&api_key=${LASTFM_API_KEY}&format=json`);
               const userPlayInfo = scrobblesResponse.data.user;
               const scrobbles = userPlayInfo.playcount;


               const embed = new EmbedBuilder()
                   .setAuthor({ name: `Last track for ${userData.lastFmUsername}`, iconURL: interaction.user.avatarURL() })
                   .setTitle(name)
                   .setColor('Random')
                   .setURL(`https://www.last.fm/music/${encodeURIComponent(artist['#text'])}/_/${encodeURIComponent(name)}`)
                   .setDescription(`${artist['#text']} | ${album['#text']}`)
                   .setFooter({ text: `Total scrobbles: ${scrobbles} | Last scrobbled at: ${new Date(date.uts * 1000).toLocaleString()}` });


               await interaction.reply({ embeds: [embed] });
           }
       } catch (error) {
           console.error(error.response ? error.response.data : error);
           await interaction.reply('Error fetching current track.');
       }
   },
};
