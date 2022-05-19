const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channel")
    .setDescription("Set the channel for sending questions")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel for sending questions")
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const channelembed = new MessageEmbed()
      .setTitle("Channel Changed")
      .setDescription(`New Questions will be sent to ${channel}`);

    interaction.reply({ embeds: [channelembed] });
  },
};
