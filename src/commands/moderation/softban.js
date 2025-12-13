const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Softban a user (ban then unban to delete messages) 🧹')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to softban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the softban')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('delete_days')
        .setDescription('Days of messages to delete (1-7)')
        .setMinValue(1)
        .setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.BanMembers],
  cooldown: 5000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason'));
    const deleteDays = interaction.options.getInteger('delete_days') || 7;
    
    try {
      let targetMember = null;
      try {
        targetMember = await interaction.guild.members.fetch(target.id);
      } catch (error) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('User is not in this server!')]
        });
      }
      
      const canExecute = CheckUtils.canExecuteOn(interaction.member, targetMember);
      if (!canExecute.success) {
        return interaction.editReply({
          embeds: [EmbedUtils.error(canExecute.reason)]
        });
      }
      
      // Send DM before softban
      try {
        const dmEmbed = EmbedUtils.moderation('Softban', interaction.user, target, reason)
          .setTitle('🧹 You have been softbanned')
          .addFields({ name: 'Server', value: interaction.guild.name, inline: true })
          .setDescription('Your messages were deleted but you can rejoin the server.');
        
        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        // DM failed
      }
      
      // Execute softban (ban then unban)
      await interaction.guild.members.ban(target.id, {
        reason: `Softban: ${reason} | Moderator: ${interaction.user.tag}`,
        deleteMessageDays: deleteDays
      });
      
      await interaction.guild.members.unban(target.id, `Softban unban | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.moderation('Softban', interaction.user, target, reason, caseId)
        .addFields({ name: 'Messages Deleted', value: `${deleteDays} day(s)`, inline: true });
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} softbanned ${target.tag}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        deleteDays,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Softban command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to softban user. Please check my permissions and try again.')]
      });
    }
  }
};