const { exec } = require('child_process');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        if (message.content.startsWith('!reauth-lab')) {
            const authKey = 'tskey-auth-kMPej477pg11CNTRL-A7c8EXb9BZUoHtNe96avYUVY96VUVDA8W'; // Paste your key here
            
            exec(`tailscale up --authkey ${authKey} --force-reauth`, (error, stdout, stderr) => {
                if (error) {
                    message.channel.send(`❌ **Error:**\n\`\`\`\n${error.message}\n\`\`\``);
                    return;
                }
                
                let response = `✅ **Success!** Dashboard should be live shortly.`;
                if (stdout) response += `\n**Output:**\n\`\`\`\n${stdout}\n\`\`\``;
                
                message.channel.send(response);
            });
        }
    },
};
