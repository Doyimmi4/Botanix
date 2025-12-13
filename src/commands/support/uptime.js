const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Check how long Botanix has been running 🕐'),
  
  cooldown: 5000,
  defer: true,
  
  async execute(interaction, client) {
    const uptime = client.getUptime();
    const formattedUptime = EmbedUtils.formatUptime(uptime);
    
    const embed = EmbedUtils.info(
      `Botanix has been running for **${formattedUptime}** 🌸`,
      '🕐 Bot Uptime'
    ).addFields(
      { name: 'Started', value: `<t:${Math.floor(client.stats.startTime / 1000)}:F>`, inline: true },
      { name: 'Commands Executed', value: `${client.stats.commandsExecuted}`, inline: true },
      { name: 'Moderation Actions', value: `${client.stats.moderationActions}`, inline: true }
    );
    
    await interaction.editReply({ embeds: [embed] });
  }
};