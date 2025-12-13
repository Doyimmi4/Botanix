const { SlashCommandBuilder } = require('discord.js');
const dayjs = require('dayjs');
const embeds = require('../../utils/embeds');

module.exports = {
  name: 'uptime',
  type: 'slash',
  data: new SlashCommandBuilder().setName('uptime').setDescription('Show bot uptime'),
  async execute({ client, interaction }) {
    const up = Date.now() - (client.readyAtTs || Date.now());
    const hours = Math.floor(up / 3600000);
    const mins = Math.floor((up % 3600000) / 60000);
    const secs = Math.floor((up % 60000) / 1000);
    const embed = embeds.info('Uptime ⏱️', `${hours}h ${mins}m ${secs}s`);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};
