// Require the necessary discord.js classes
const { Client, Intents, Message } = require("discord.js");
const { measureMemory } = require("vm");
const { token, admin_role } = require("./config.json");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");

const { DB, sequelize } = require("./db/db_init");

const CronJob = require("cron").CronJob;

// define global variables
var timer_enabled = false;
var channel;
var lastmsg;

// Create a new client instance
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
  ],
  partials: ["MESSAGE", "CHANNEL", "USER"],
});

client.config = require("./config.json");

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  DB.qotd.sync();
  console.log("Ready!");

  if (client.config.enable_activity) {
    await client.user.setActivity(client.config.activity.name, {
      type: client.config.activity.type,
    });
  }

  const job = new CronJob(
    `0 12 * * *`,
    function () {
      let today = new Date().toLocaleDateString();
      let time = Math.round(new Date().getTime() / 1000).toString();
      const question = DB.qotd
        .findOne({ order: [sequelize.fn("rand")] })
        .then((question) => {
          if (question === null) {
            const errorembed = new MessageEmbed()
              .setTitle(`Error`)
              .setColor("#FF0000")
              .setDescription(`No Question Found`);

            console.log("No questions found");
          } else {
            if (!lastmsg) {
              console.log("Last message doesn't exist");
            } else {
              const QOTDchannel = client.channels.cache.get(`${channel}`);

              QOTDchannel.messages.fetch(lastmsg).then((msg) => msg.unpin());
            }

            const questionembed = new MessageEmbed()
              .setTitle(`QOTD ${today}`)
              .setDescription(`${question.Question}`)
              .setColor(`GREEN`)
              .setThumbnail(
                `https://raw.githubusercontent.com/tylerguy/qotd-bot/main/QOTD%20Icon.png`
              )
              .addFields({ name: "Generated at", value: `<t:${time}:t>` });

            const QOTD = client.channels.cache
              .get(`${channel}`)
              .send({
                embeds: [questionembed],
              })
              .then((QOTD) => {
                QOTD.pin();
                lastmsg = QOTD.id;
              })
              .then(function () {
                console.log(lastmsg);
              });

            DB.qotd.destroy({ where: { Question: question.Question } });
          }
        });
    },
    null,
    true,
    "America/Los_Angeles"
  );
});

client.on("message", async (message) => {
  if (message.content.startsWith("!disable")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    timer_enabled = false;
  }

  if (message.content.startsWith("!enable")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    timer_enabled = true;
  }

  if (message.content.startsWith("!state")) {
    if (!message.member.roles.cache.has("973731765703282708"))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    if (timer_enabled === true) {
      const enabledembed = new MessageEmbed()
        .setTitle(`Timer State`)
        .setDescription(`QOTD is enabled.`)
        .setColor(`GREEN`);
      message.channel.send({ embeds: [enabledembed] });
    } else {
      const disabledembed = new MessageEmbed()
        .setTitle(`Timer State`)
        .setDescription(`QOTD is disabled.`)
        .setColor(`RED`);
      message.channel.send({ embeds: [disabledembed] });
    }
  }

  /*  if (message.content.startsWith("!pins")) {
    const botchannel = client.channels.cache.get("976919179389182012");
    const lastmsg = "976920701342732369";

    botchannel.messages.fetch(lastmsg).then((msg) => msg.unpin());
  } */

  if (message.content.startsWith("!submit")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );

    const submitter = message.member.user.username;
    const args = message.content
      .slice("!submit")
      .trim()
      .split(" ")
      .slice(1)
      .join(` `);

    const qotd = await DB.qotd.create({
      Question: `${args}`,
      Submitter: `${submitter}`,
    });

    const qotdembed = new MessageEmbed()
      .setTitle("New Question added")
      .setColor(`#1ABC9C`)
      .addFields(
        { name: "Question", value: `${qotd.Question}` },
        { name: "Submitter", value: `${qotd.Submitter}` }
      );
    message.channel.send({ embeds: [qotdembed] });
  }
  if (message.content.startsWith("!random")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    let today = new Date().toLocaleDateString();
    let time = Math.round(new Date().getTime() / 1000).toString();
    const question = DB.qotd
      .findOne({ order: [sequelize.fn("rand")] })
      .then((question) => {
        if (question === null) {
          const errorembed = new MessageEmbed()
            .setTitle(`Error`)
            .setColor("#FF0000")
            .setDescription(`No Question Found`);

          message.channel.send({ embeds: [errorembed] });
        } else {
          if (!lastmsg) {
            console.log("Last message doesn't exist");
          } else {
            const QOTDchannel = client.channels.cache.get(`${channel}`);

            QOTDchannel.messages.fetch(lastmsg).then((msg) => msg.unpin());
          }

          const questionembed = new MessageEmbed()
            .setTitle(`QOTD ${today}`)
            .setDescription(`${question.Question}`)
            .setColor(`GREEN`)
            .setThumbnail(
              `https://raw.githubusercontent.com/tylerguy/qotd-bot/main/QOTD%20Icon.png`
            )
            .addFields({ name: "Generated at", value: `<t:${time}:t>` });

          const QOTD = client.channels.cache
            .get(`${channel}`)
            .send({
              embeds: [questionembed],
            })
            .then((QOTD) => {
              QOTD.pin();
              lastmsg = QOTD.id;
            })
            .then(function () {
              console.log(lastmsg);
            });

          DB.qotd.destroy({ where: { Question: question.Question } });
        }
      });
  }

  if (message.content.startsWith("!idcheck")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    message.channel.send(lastmsg);
  }
  if (message.content.startsWith("!channel")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    channel = message.content
      .slice("!channel")
      .trim()
      .split(" ")
      .slice(1)
      .join(` `);

    const channelembed = new MessageEmbed()
      .setTitle("Channel Changed")
      .setDescription(`New Questions will be sent to <#${channel}>`);

    message.channel.send({ embeds: [channelembed] });
  }
  if (message.content.startsWith("!help")) {
    if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      );
    const HelpEmbed = new MessageEmbed()
      .setTitle(`Command List`)
      .setColor(`RED`)
      .addFields(
        { name: `!help`, value: `Displays this list of commands` },
        {
          name: `!submit`,
          value: `Submits a question into the pool of questions`,
        },
        {
          name: `!enable/disable`,
          value: `Enables/Disables the automatic timer for sending questions`,
        },
        {
          name: `!random`,
          value: `Sends a new question to the configured channel`,
        },
        {
          name: `!channel`,
          value: `Specifies the channel a new question should be posted`,
        }
      );

    message.channel.send({ embeds: [HelpEmbed] });
  }

  if (message.content.startsWith("!list")) {
    /*if (!message.member.roles.cache.has(`${admin_role}`))
      return message.channel.send(
        "You don't have permission to use this command"
      ); */

    DB.qotd.findAll({ attributes: ["Question"] }).then((questions) => {
      const listembed = new MessageEmbed()
        .setTitle(`Question List`)
        .setColor(`RED`)
        .setDescription(
          `${questions.map((question) => question.Question).join("\n\n**-** ")}`
        );

      message.channel.send({ embeds: [listembed] });
    });
  }
});

// Login to Discord with your client's token
client.login(token);
