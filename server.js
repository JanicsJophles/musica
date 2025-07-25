const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const db = require('./src/database');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000; // Change to 3000 before pushing code
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_SHARED_SECRET = process.env.LASTFM_SHARED_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.use(helmet());
app.use(cors());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/html_scripts', express.static(path.join(__dirname, 'html_scripts')));
app.use('/widgets', express.static(path.join(__dirname, 'widgets')));

if (!LASTFM_API_KEY || !LASTFM_SHARED_SECRET || !REDIRECT_URI) {
    console.error('Error: Missing required environment variables');
    process.exit(1);
}

function generateApiSig(params) {
    const keys = Object.keys(params).sort();
    const sigString = keys.map(key => key + params[key]).join('') + LASTFM_SHARED_SECRET;
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

        const apiSig = generateApiSig(params);
        const encodedParams = querystring.stringify({ ...params, api_sig: apiSig, format: 'json' });
        const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?${encodedParams}`);
      
        const sessionKey = response.data.session.key;
        const username = response.data.session.name;

        await new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO users (discordUserId, lastFmUsername, lastFmSessionKey) VALUES (?, ?, ?)`,
                [user, username, sessionKey],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        res.redirect(`/authenticated.html?username=${encodeURIComponent(username)}`);
    } catch (error) {
        console.error(error.response ? error.response.data : error);
        res.status(500).send('Error during authentication');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/terms.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/privacy.html'));
});

app.get('/authenticated.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/authenticated.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});