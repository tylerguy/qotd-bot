// Require the necessary discord.js classes
const {
    Client,
    Intents,
    Message
} = require('discord.js');
const {
    measureMemory
} = require('vm');
const {
    token,
    admin_role,
    timer
} = require('./config.json');
const Discord = require('discord.js')
const {
    MessageEmbed
} = require('discord.js');

const {
    DB,
    sequelize
} = require('./db/db_init');

const CronJob = require('cron').CronJob;

var timer_enabled = true;
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


    if (enable_timer === true) {
    const job = new CronJob(
        `${timer}`,
        function () {
            let today = new Date().toLocaleDateString()
            let time = Math.round(new Date().getTime() / 1000).toString()
            DB.qotd.findOne({
                order: [
                    sequelize.fn('rand')
                ]
            }).then(question => {

                if (question === null) {
                   /* const errorembed = new MessageEmbed()
                        .setTitle(`Error`)
                        .setColor("#FF0000")
                        .setDescription(`No Question Found`)

                    message.channel.send({
                        embeds: [errorembed] 
                    }) */
                    console.log("No Questions Found")
                } else {

                    const questionembed = new MessageEmbed()
                        .setTitle(`QOTD ${today}`)
                        .setDescription(`${question.Question}`)
                        .setThumbnail(`https://raw.githubusercontent.com/tylerguy/qotd-bot/main/QOTD%20Icon.png`)
                        .addFields({
                            name: 'Generated at',
                            value: `<t:${time}:t>`
                        })

                    client.channels.cache.get("950531059827769354").send({
                        embeds: [questionembed]
                    })

                    DB.qotd.destroy({
                        where: {
                            Question: question.Question
                        }
                    })
                }
            })
        },
        null,
        true,
        'America/Los_Angeles'

    )}
});

client.on('message', async message => {

    if (message.content.startsWith("!disable")) {
    timer_enabled = false;
    }

    if (message.content.startsWith("!enable")) {
    timer_enabled = true;
    }

    if (message.content.startsWith("!state")) {
    
        if (timer_enabled === true) {
            const enabledembed = new MessageEmbed()
            .setTitle(`Timer State`)
            .setDescription(`QOTD is enabled.`)
            .setColor(`GREEN`)
            message.channel.send({embeds: [enabledembed]})
        }
        else {
            const disabledembed = new MessageEmbed()
            .setTitle(`Timer State`)
            .setDescription(`QOTD is disabled.`)
            .setColor(`RED`)
            message.channel.send({embeds: [disabledembed]})
        }
    }

    
    
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

            if (question === null) {
                const errorembed = new MessageEmbed()
                    .setTitle(`Error`)
                    .setColor("#FF0000")
                    .setDescription(`No Question Found`)

                message.channel.send({
                    embeds: [errorembed]
                })
            } else {

                const questionembed = new MessageEmbed()
                    .setTitle(`QOTD ${today}`)
                    .setDescription(`${question.Question}`)
                    .setThumbnail(`https://raw.githubusercontent.com/tylerguy/qotd-bot/main/QOTD%20Icon.png`)
                    .addFields({
                        name: 'Generated at',
                        value: `<t:${time}:t>`
                    })

                message.channel.send({
                    embeds: [questionembed]
                })

                DB.qotd.destroy({
                    where: {
                        Question: question.Question
                    }
                })
            }
        })
    }
})

// Login to Discord with your client's token
client.login(token);