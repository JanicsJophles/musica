const sqlite3 = require('sqlite3').verbose();
const path = require('path');


// Connect to the SQLite database
const dbPath = path.join(__dirname, 'musica.db');
const db = new sqlite3.Database(dbPath, (err) => {
   if (err) {
       console.error('Failed to connect to the database', err);
   } else {
       console.log('Connected to the SQLite database');
   }
});


// Initialize the database tables
db.serialize(() => {
   db.run(`CREATE TABLE IF NOT EXISTS users (
       discordUserId TEXT PRIMARY KEY,
       lastFmUsername TEXT,
       lastFmSessionKey TEXT
   )`);
});


module.exports = db;
