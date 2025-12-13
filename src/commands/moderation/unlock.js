const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel 🔓')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to unlock (default: current channel)'))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unlocking the channel'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageChannels],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || 'Channel unlocked');
    
    try {
      // Check if channel is locked
      const everyoneRole = interaction.guild.roles.everyone;
      const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
      
      if (!permissions || !permissions.deny.has(PermissionFlagsBits.SendMessages)) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This channel is not locked!')]
        });
      }
      
      // Unlock the channel
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null
      }, { reason: `${reason} | Moderator: ${interaction.user.tag}` });
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.success(
        `Successfully unlocked ${channel}`,
        '🔓 Channel Unlocked'
      ).addFields(
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Case ID', value: `#${caseId}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Send unlock message to the channel if it's not the same channel
      if (channel.id !== interaction.channel.id) {
        try {
          const unlockEmbed = EmbedUtils.success(
            `This channel has been unlocked by ${interaction.user.tag}\n**Reason:** ${reason}`,
            '🔓 Channel Unlocked'
          );
          await channel.send({ embeds: [unlockEmbed] });
        } catch (error) {
          // Channel might not allow bot to send messages
        }
      }
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} unlocked ${channel.name}`, {
        moderator: interaction.user.id,
        channel: channel.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Unlock command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to unlock channel. Please check my permissions and try again.')]
      });
    }
  }
};