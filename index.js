// Require the necessary discord.js classes
const { Client, Intents, Message } = require('discord.js');
const { measureMemory } = require('vm');
const { token, admin_role } = require('./config.json');
const Discord = require('discord.js')
const {
  MessageEmbed
} = require('discord.js');

const {
  DB, sequelize
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
    if (!message.member.roles.cache.has(`${admin_role}`)) return message.channel.send("You don't have permission to use this command")

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
      let today = new Date().toLocaleDateString()
      let time = Math.round(new Date().getTime() / 1000).toString()
    const question = DB.qotd.findOne({
      order: [
          sequelize.fn('rand')
      ]
    }).then(question => {

    const questionembed = new MessageEmbed()
    .setTitle(`QOTD ${today}`)
    .setDescription(`${question.Question}`)
    
    .addFields({
              name: 'Generated at',
              value: `<t:${time}:t>`
            })

    message.channel.send({embeds: [questionembed]})


    })
  }
    
})

// Login to Discord with your client's token
client.login(token);