const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const PermissionUtils = require('../../utils/permissions');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Warn User')
    .setType(ApplicationCommandType.User),
  
  permission: config.levels.MODERATOR,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const target = interaction.targetUser;
    
    try {
      // Get member
      const targetMember = await interaction.guild.members.fetch(target.id);
      if (!targetMember) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('User is not in this server!')]
        });
      }
      
      // Check if user can be moderated
      const canExecute = CheckUtils.canExecuteOn(interaction.member, targetMember);
      if (!canExecute.success) {
        return interaction.editReply({
          embeds: [EmbedUtils.error(canExecute.reason)]
        });
      }
      
      // Default reason for context menu
      const reason = 'Quick warn via context menu';
      
      // Generate case ID
      const caseId = Date.now().toString().slice(-6);
      
      // Send DM to user
      try {
        const dmEmbed = EmbedUtils.moderation('Warning', interaction.user, target, reason)
          .setTitle('⚠️ You have been warned')
          .addFields({ name: 'Server', value: interaction.guild.name, inline: true });
        
        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        // DM failed, continue
      }
      
      // Success embed
      const successEmbed = EmbedUtils.moderation('Warning', interaction.user, target, reason, caseId);
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Update stats
      client.incrementStat('moderationActions');
      
      // Log action
      logger.moderation(`${interaction.user.tag} warned ${target.tag} via context menu`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Warn context menu error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to warn user. Please try again.')]
      });
    }
  }
};