require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Configuration ---
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- Google API Setup ---
const KEYFILEPATH = path.join(__dirname, 'client_secret.json');
const KEYS = JSON.parse(fs.readFileSync(KEYFILEPATH).toString());

const oAuth2Client = new google.auth.OAuth2(
    KEYS.web.client_id,
    KEYS.web.client_secret,
    KEYS.web.redirect_uris[0] // Assumes the first redirect URI is the correct one
);

// This will store the user's tokens in memory.
// For a real app, you'd save this to a database.
let userTokens = null;

// --- API Routes ---

// Test route to check server status
app.get('/api/test', (req, res) => {
    res.json({ message: "Hello from the backend! 👋" });
});

// 1. Login Route - Generates the Google Auth URL
app.get('/login', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload'
    ];

    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Forces consent screen every time for refresh_token
    });

    res.redirect(authorizeUrl);
});

// 2. OAuth2 Callback Route - Handles the redirect from Google
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Error: Code not found in query.');
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        userTokens = tokens; // Store tokens

        console.log('Tokens acquired successfully!');
        if (tokens.refresh_token) {
            console.log('Received a refresh token.');
        }

        // Redirect user back to the frontend
        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('Error acquiring tokens:', error.message);
        res.status(500).send('Error acquiring tokens.');
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
