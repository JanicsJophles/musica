module.exports = {
    name: 'ready',
    once: true, // This event should only be triggered once
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
    },
 };
 