// Require the necessary discord.js classes
const {Client, Intents, Message} = require("discord.js");
const {measureMemory} = require("vm");
const {token, admin_role} = require("./config.json");
const Discord = require("discord.js");
const {MessageEmbed} = require("discord.js");

const {DB, sequelize} = require("./db/db_init");

const CronJob = require("cron").CronJob;

var timer_enabled = false;
var channel;
// Create a new client instance
const client = new Discord.Client({
  intents : [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
  ],
  partials : [ "MESSAGE", "CHANNEL", "USER" ],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  DB.qotd.sync();
  console.log("Ready!");

  const job = new CronJob(`* * * * *`, function() {
    let today = new Date().toLocaleDateString();
    let time = Math.round(new Date().getTime() / 1000).toString();
    DB.qotd.findOne({order : [ sequelize.fn("rand") ]}).then((question) => {
      if (timer_enabled === true) {
        if (question === null) {
          /* const errorembed = new MessageEmbed()
                 .setTitle(`Error`)
                 .setColor("#FF0000")
                 .setDescription(`No Question Found`)

             message.channel.send({
                 embeds: [errorembed]
             }) */
          console.log("No Questions Found");
        } else {
          const questionembed =
              new MessageEmbed()
                  .setTitle(`QOTD ${today}`)
                  .setDescription(`${question.Question}`)
                  .setColor(`GREEN`)
                  .setThumbnail(
                      `https://raw.githubusercontent.com/tylerguy/qotd-bot/main/QOTD%20Icon.png`)
                  .addFields({name : "Generated at", value : `<t:${time}:t>`});

          client.channels.cache.get(channel).send({embeds : [ questionembed ]});

          DB.qotd.destroy({where : {Question : question.Question}});
        }
      }
    });
  }, null, true, "America/Los_Angeles");
});

client.on("message", async (message) => {
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
                               .setColor(`GREEN`);
      message.channel.send({embeds : [ enabledembed ]});
    } else {
      const disabledembed = new MessageEmbed()
                                .setTitle(`Timer State`)
                                .setDescription(`QOTD is disabled.`)
                                .setColor(`RED`);
      message.channel.send({embeds : [ disabledembed ]});
    }
  }

  if (message.content.startsWith("!submit")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
          "You don't have permission to use this command");

    const submitter = message.member.user.username;
    const args =
        message.content.slice("!submit").trim().split(" ").slice(1).join(` `);

    const qotd = await DB.qotd.create({
      Question : `${args}`,
      Submitter : `${submitter}`,
    });

    const qotdembed =
        new MessageEmbed()
            .setTitle("New Question added")
            .setColor(`#1ABC9C`)
            .addFields({name : "Question", value : `${qotd.Question}`},
                       {name : "Submitter", value : `${qotd.Submitter}`});
    message.channel.send({embeds : [ qotdembed ]});
  }
  if (message.content.startsWith("!random")) {
    let today = new Date().toLocaleDateString();
    let time = Math.round(new Date().getTime() / 1000).toString();
    const question =
        DB.qotd.findOne({order : [ sequelize.fn("rand") ]}).then((question) => {
          if (question === null) {
            const errorembed = new MessageEmbed()
                                   .setTitle(`Error`)
                                   .setColor("#FF0000")
                                   .setDescription(`No Question Found`);

            message.channel.send({embeds : [ errorembed ]});
          } else {
            const questionembed =
                new MessageEmbed()
                    .setTitle(`QOTD ${today}`)
                    .setDescription(`${question.Question}`)
                    .setColor(`GREEN`)
                    .setThumbnail(
                        `https://raw.githubusercontent.com/tylerguy/qotd-bot/main/QOTD%20Icon.png`)
                    .addFields(
                        {name : "Generated at", value : `<t:${time}:t>`});

            client.channels.cache.get(`${channel}`).send({
              embeds : [ questionembed ],
            });

            DB.qotd.destroy({where : {Question : question.Question}});
          }
        });
  }

  if (message.content.startsWith("!channel")) {
    channel =
        message.content.slice("!channel").trim().split(" ").slice(1).join(` `);

    const channelembed =
        new MessageEmbed()
            .setTitle("Channel Changed")
            .setDescription(`New Questions will be sent to <#${channel}>`);

    message.channel.send({embeds : [ channelembed ]});
  }
  if (message.content.startsWith("!help")) {
    const HelpEmbed =
        new MessageEmbed()
            .setTitle(`Command List`)
            .setColor(`RED`)
            .addFields(
                {name : `!help`, value : `Displays this list of commands`}, {
                  name : `!submit`,
                  value : `Submits a question into the pool of questions`,
                },
                {
                  name : `!enable/disable`,
                  value :
                      `Enables/Disables the automatic timer for sending questions`,
                },
                {
                  name : `!random`,
                  value : `Sends a new question to the configured channel`,
                },
                {
                  name : `!channel`,
                  value :
                      `Specifies the channel a new question should be posted`,
                });

    message.channel.send({embeds : [ HelpEmbed ]});
  }
});

// Login to Discord with your client's token
client.login(token);
