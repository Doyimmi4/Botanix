const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Timeout User')
    .setType(ApplicationCommandType.User),
  
  permission: config.levels.MODERATOR,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const target = interaction.targetUser;
    
    try {
      const targetMember = await interaction.guild.members.fetch(target.id);
      if (!targetMember) {
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
      
      // Default 10 minute timeout
      const duration = 10 * 60 * 1000; // 10 minutes
      const reason = 'Quick timeout via context menu';
      
      await targetMember.timeout(duration, `${reason} | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.moderation('Timeout', interaction.user, target, reason, caseId, '10 minutes');
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Send DM
      try {
        const dmEmbed = EmbedUtils.moderation('Timeout', interaction.user, target, reason)
          .setTitle('⏰ You have been timed out')
          .addFields(
            { name: 'Server', value: interaction.guild.name, inline: true },
            { name: 'Duration', value: '10 minutes', inline: true }
          );
        
        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        // DM failed
      }
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} timed out ${target.tag} via context menu`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        duration: '10 minutes',
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Timeout context menu error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to timeout user. Please try again.')]
      });
    }
  }
};