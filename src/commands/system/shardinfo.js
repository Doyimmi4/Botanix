const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  name: 'shardinfo',
  type: 'slash',
  data: new SlashCommandBuilder().setName('shardinfo').setDescription('Show sharding info'),
  async execute({ client, interaction }) {
    let desc = `This shard: **${client.shard?.ids?.[0] ?? 0}**`;
    if (client.shard && client.shard.broadcastEval) {
      const guildCounts = await client.shard.broadcastEval(c => c.guilds.cache.size);
      desc += `\nShard count: **${client.shard.count}**\nGuilds by shard: ${guildCounts.join(', ')}`;
    }
    const embed = embeds.info('Shard info', desc);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};
