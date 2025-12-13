const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete multiple messages 🗑️')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Only delete messages from this user'))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for purging messages'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageMessages],
  cooldown: 5000,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || 'Message purge');
    
    try {
      // Fetch messages
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      
      // Filter messages if user specified
      let messagesToDelete = messages;
      if (targetUser) {
        messagesToDelete = messages.filter(msg => msg.author.id === targetUser.id);
      }
      
      // Filter messages older than 14 days (Discord limitation)
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const validMessages = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
      
      if (validMessages.size === 0) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('No messages found to delete! Messages older than 14 days cannot be bulk deleted.')]
        });
      }
      
      // Delete messages
      const deleted = await interaction.channel.bulkDelete(validMessages, true);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.success(
        `Successfully deleted ${deleted.size} message(s)${targetUser ? ` from ${targetUser.tag}` : ''}`,
        '🗑️ Messages Purged'
      ).addFields(
        { name: 'Channel', value: interaction.channel.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Case ID', value: `#${caseId}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} purged ${deleted.size} messages`, {
        moderator: interaction.user.id,
        channel: interaction.channel.id,
        amount: deleted.size,
        targetUser: targetUser?.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Purge command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to purge messages. Please check my permissions and try again.')]
      });
    }
  }
};