const { ActivityType } = require('discord.js')

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        
        // Set bot status
        client.user.setPresence({
            activities: [{ 
                name: 'to some good tunes!', 
                type: ActivityType.Listening, 
                
            }], 
            status: 'idle', // online, idle, dnd (do not disturb), invisible
        });
    },
};
