// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const Sequelize = require('sequelize');

const {
  DB
} = require('./db/db_init');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	DB.qotd.sync();
    console.log('Ready!');
});

// Login to Discord with your client's token
client.login(token);