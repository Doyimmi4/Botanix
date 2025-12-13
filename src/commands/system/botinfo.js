const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { BOT_NAME } = require('../../config/bot');

module.exports = {
  name: 'botinfo',
  type: 'slash',
  data: new SlashCommandBuilder().setName('botinfo').setDescription('About Botanix'),
  async execute({ client, interaction }) {
    const mem = process.memoryUsage();
    const embed = embeds.info(`${BOT_NAME} info`, `Servers: **${client.guilds.cache.size}**\nUsers: **${client.users.cache.size}**`)
      .addFields({ name: 'Memory', value: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true });
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};
