const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel 🔒')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to lock (default: current channel)'))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for locking the channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageChannels],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || 'Channel locked');
    
    try {
      // Check if channel is already locked
      const everyoneRole = interaction.guild.roles.everyone;
      const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
      
      if (permissions && permissions.deny.has(PermissionFlagsBits.SendMessages)) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This channel is already locked!')]
        });
      }
      
      // Lock the channel
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false
      }, { reason: `${reason} | Moderator: ${interaction.user.tag}` });
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.success(
        `Successfully locked ${channel}`,
        '🔒 Channel Locked'
      ).addFields(
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Case ID', value: `#${caseId}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Send lock message to the channel if it's not the same channel
      if (channel.id !== interaction.channel.id) {
        try {
          const lockEmbed = EmbedUtils.warning(
            `This channel has been locked by ${interaction.user.tag}\n**Reason:** ${reason}`,
            '🔒 Channel Locked'
          );
          await channel.send({ embeds: [lockEmbed] });
        } catch (error) {
          // Channel might not allow bot to send messages
        }
      }
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} locked ${channel.name}`, {
        moderator: interaction.user.id,
        channel: channel.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Lock command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to lock channel. Please check my permissions and try again.')]
      });
    }
  }
};