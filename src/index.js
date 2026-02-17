const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // Load environment variables from .env file


const token = process.env.DISCORD_TOKEN;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


client.commands = new Collection();


const readCommands = (dir) => {
   const files = fs.readdirSync(dir, { withFileTypes: true });
   for (const file of files) {
       if (file.isDirectory()) {
           readCommands(path.join(dir, file.name));
       } else if (file.name.endsWith('.js')) {
           const filePath = path.join(dir, file.name);
           const command = require(filePath);
           client.commands.set(command.data.name, command);
       }
   }
};


const loadEvents = (dir) => {
   const files = fs.readdirSync(dir, { withFileTypes: true });
   for (const file of files) {
       if (file.isDirectory()) {
           loadEvents(path.join(dir, file.name));
       } else if (file.name.endsWith('.js')) {
           const filePath = path.join(dir, file.name);
           const event = require(filePath);
           if (event.once) {
               client.once(event.name, (...args) => event.execute(...args, client));
           } else {
               client.on(event.name, (...args) => event.execute(...args, client));
           }
       }
   }
};


readCommands(path.join(__dirname, 'commands'));
loadEvents(path.join(__dirname, 'events'));


client.login(token);