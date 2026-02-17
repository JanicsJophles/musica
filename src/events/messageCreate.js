const { exec } = require('child_process');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        if (message.content.startsWith('!reauth-lab')) {
            const authKey = tskey-auth-kXS2J77eXk11CNTRL-GvYgWpGQHCMFoeqt1f77CMUj6zM9CRM9h; // Paste your key here
            
            exec(`tailscale up --authkey ${authKey} --force-reauth`, (error, stdout, stderr) => {
                if (error) {
                    message.channel.send(`Error: ${error.message}`);
                    return;
                }
                message.channel.send(`Success! Dashboard should be live shortly.`);
            });
        }
    },
};
