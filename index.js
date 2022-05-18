// Require the necessary discord.js classes
const { Client, Intents, Message } = require('discord.js');
const { measureMemory } = require('vm');
const { token } = require('./config.json');

const {
  DB
} = require('./db/db_init');

// Create a new client instance
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_BANS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
})

// When the client is ready, run this code (only once)
client.once('ready', () => {
	DB.qotd.sync();
    console.log('Ready!');
});

client.on('message', async message => {
    
if (message.content.startsWith("!submit")) {

    const submitter = message.member.user.username;
    const args = message.content.slice("!submit").trim().split(' ').slice(1).join(` `);

    const qotd = await DB.qotd.create({

      Question: `${args}`,
      Submitter: `${submitter}`

    })

    const qotdembed = new MessageEmbed()
      .setTitle("New Question added")
      .setColor(`#1ABC9C`)
      .addFields({
        "name": "Question",
        "value": `${qotd.Question}`
      }, {
        "name": "Submitter",
        "value": `${qotd.Submitter}`
      })
    message.channel.send({
      embeds: [qotdembed]
    })
  }
  if (message.content.startsWith("!random")) {
    DB.qotd.findOne({
      Question: 'rand()'
    }).then((question) => {
      console.log(question.Question)
    });
  }
    
})

// Login to Discord with your client's token
client.login(token);