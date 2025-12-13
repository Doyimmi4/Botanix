const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode 🐌')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode duration in seconds (0-21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to set slowmode (default: current channel)'))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for setting slowmode'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageChannels],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || 'Slowmode updated');
    
    try {
      // Check if channel is a text channel
      if (!channel.isTextBased()) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('Slowmode can only be set on text channels!')]
        });
      }
      
      // Set slowmode
      await channel.setRateLimitPerUser(seconds, `${reason} | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.success(
        seconds === 0 
          ? `Slowmode disabled in ${channel}`
          : `Slowmode set to ${seconds} second(s) in ${channel}`,
        '🐌 Slowmode Updated'
      ).addFields(
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Duration', value: seconds === 0 ? 'Disabled' : `${seconds} second(s)`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Case ID', value: `#${caseId}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} set slowmode to ${seconds}s in ${channel.name}`, {
        moderator: interaction.user.id,
        channel: channel.id,
        seconds,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Slowmode command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to set slowmode. Please check my permissions and try again.')]
      });
    }
  }
};