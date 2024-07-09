const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const db = require('./src/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;  // Use PORT from environment or default to 3000
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_SHARED_SECRET = process.env.LASTFM_SHARED_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Check if required environment variables are set
if (!LASTFM_API_KEY || !LASTFM_SHARED_SECRET || !REDIRECT_URI) {
    console.error('Error: Missing required environment variables');
    process.exit(1);
}

// Generates API signature needed for Last.fm requests
function generateApiSig(params) {
    const keys = Object.keys(params).sort();
    const sigString = keys.map(key => key + params[key]).join('') + LASTFM_SHARED_SECRET;
    console.log('Signature String:', sigString); // Log the complete string before hashing
    return crypto.createHash('md5').update(sigString, 'utf8').digest('hex');
}

app.get('/auth', (req, res) => {
    const discordUserId = req.query.user;
    const lastFmUrl = `https://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&cb=${encodeURIComponent(`${REDIRECT_URI}?user=${discordUserId}`)}`;
    res.redirect(lastFmUrl);
});

app.get('/callback', async (req, res) => {
    const { token, user } = req.query;

    if (!token || !user) {
        return res.status(400).send('Error: Missing token or user');
    }

    try {
        const params = {
            api_key: LASTFM_API_KEY,
            method: 'auth.getSession',
            token: token,
        };

        // Generating API signature
        const apiSig = generateApiSig(params);
        console.log('Params for request:', params);
        console.log('Generated API Signature:', apiSig);

        // URL-encode parameters
        const encodedParams = querystring.stringify({ ...params, api_sig: apiSig, format: 'json' });

        const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?${encodedParams}`);
      
        // Extract session key and username
        const sessionKey = response.data.session.key;
        const username = response.data.session.name;

        // Log the received username and session key for debugging
        console.log('Received from Last.fm:', { username, sessionKey });

        // Save sessionKey and username to the database
        db.run(`INSERT OR REPLACE INTO users (discordUserId, lastFmUsername, lastFmSessionKey) VALUES (?, ?, ?)`,
            [user, username, sessionKey],
            (err) => {
                if (err) {
                    console.error('Error saving user data to the database', err);
                    res.status(500).send('Error during authentication');
                } else {
                    res.send(`Authenticated as ${username}`);
                }
            }
        );
    } catch (error) {
        console.error(error.response ? error.response.data : error);
        res.status(500).send('Error during authentication');
    }
});

app.listen(port, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
