const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  name: 'status',
  type: 'slash',
  data: new SlashCommandBuilder().setName('status').setDescription('Show shard and API status'),
  async execute({ client, interaction }) {
    const embed = embeds.info('Status', `Shards: **${client.shard?.count || 1}**\nGuilds: **${client.guilds.cache.size}**\nPing: **${Math.round(client.ws.ping)}ms**`);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};
