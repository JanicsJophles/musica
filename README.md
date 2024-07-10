# 🎶 Musica Discord Bot 🎶

Welcome to **Musica**, a Discord bot that leverages the Last.fm API to bring you music information straight to your Discord server using discord.js v14!


## 📋 Prerequisites

Before you get started, make sure you have the following:

1. **Node.js** and **npm** installed on your system.
2. A **Discord bot token**. You can get one by creating a bot on the [Discord Developer Portal](https://discord.com/developers/applications).
3. A **Last.fm API Key**. You can create one [here](https://www.last.fm/api/account/create).

## 🌟 Getting Started

1. **Clone the repository**:

    ```bash
    git clone https://github.com/YourUsername/musica.git
    cd musica
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables**:

    Create a `.env` file in the root directory and fill it with the following:

    ```env
    DISCORD_TOKEN=your-discord-token
    CLIENT_ID=your-discord-client-id
    GUILD_ID=your-discord-guild-id
    LASTFM_API_KEY=your-lastfm-api-key
    LASTFM_SHARED_SECRET=your-lastfm-shared-secret
    REDIRECT_URI=http://localhost:3000/callback
    URL=http://localhost:3000/
    PORT=3000
    ```

    Replace the placeholder values with your actual keys and IDs.

4. **Run the bot**:

    Use `concurrently` to start both the server and the bot:

    ```bash
    npm start
    ```

## 🛠️ Configuration Details

### Environment Variables

- **DISCORD_TOKEN**: Your bot's token.
- **CLIENT_ID**: Your Discord bot's client ID.
- **GUILD_ID**: The ID of the server where you want to deploy commands. For global deployment, adjust the deployment script.
- **LASTFM_API_KEY**: Your Last.fm API key.
- **LASTFM_SHARED_SECRET**: Your Last.fm secret key.
- **REDIRECT_URI**: Used for Last.fm OAuth callbacks. Should point to your server.
- **URL**: Base URL for your server.
- **PORT**: Port your bot server will listen on.

### Setting Up and Deploying Your Database

Currently, we use SQLite for local development. For production, you might consider using MongoDB:

1. **Set up MongoDB**:

    - Create a MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

2. **Install MongoDB dependencies**:

    ```bash
    npm install mongoose
    ```

3. **Update database.js**:

    Replace SQLite connection with MongoDB:

    ```javascript
    const mongoose = require('mongoose');
    require('dotenv').config();

    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('Connected to MongoDB');
    });

    module.exports = db;
    ```

4. **Use MongoDB Online**:

    Ensure you set your `MONGO_URI` environment variable in your hosting settings.

### 🌐 Hosting

- If hosting on a platform like Heroku, set your environment variables in the platform's settings.
- Adjust the `REDIRECT_URI`, `URL`, and `PORT` to reflect your hosting setup.

### 🛡️ Authentication Flow

1. **Login Command (`/login`)**:

    Directs users to authenticate with Last.fm and redirects back to your server.

2. **Callback Endpoint (`/callback`)**:

    Handles Last.fm OAuth callback, saves user data to the database.

### 🎵 Commands

- **/login**: Authenticate with Last.fm.
- **/nowplaying**: Display the track you're currently listening to.

## 🚀 Starting the Bot

To start the bot with MongoDB, you might not need the `concurrently` package if your `server.js` is only for handling OAuth redirects. Adjust your `start` script accordingly:

```json
"scripts": {
    "start": "node src/index.js"
}
```

## 🗑️ Deleting Commands

The delete.js script removes all slash commands. Modify it for global or guild-based deletion:

```javascript
await rest.delete(
    `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`
);
// OR for global
await rest.delete(
    `${Routes.applicationCommands(clientId)}/${command.id}`
);
```

## 🚨 Issues and Contributions

- Report issues or request features [here](https://github.com/JanicsJophles/musica/issues).
- Contributions are super welcome! Make sure to fork the repository and create a pull request.

## 🎉 Enjoy Your Bot!
Thank you for using Musica. We hope it makes your Discord experience even more enjoyable with seamless integration to Last.fm! 🎧
