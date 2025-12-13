const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member ⏰')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 10m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('silent')
        .setDescription('Don\'t send DM to user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason'));
    const silent = interaction.options.getBoolean('silent') || false;
    
    try {
      // Parse duration
      const duration = CheckUtils.parseTime(durationStr);
      if (!duration) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('Invalid duration format! Use formats like: 10m, 1h, 2d')]
        });
      }
      
      // Check duration limits (Discord max: 28 days)
      const maxDuration = 28 * 24 * 60 * 60 * 1000; // 28 days
      if (duration > maxDuration) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('Timeout duration cannot exceed 28 days!')]
        });
      }
      
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
      
      // Check if already timed out
      if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > Date.now()) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This user is already timed out!')]
        });
      }
      
      // Send DM before timeout (if not silent)
      if (!silent) {
        try {
          const dmEmbed = EmbedUtils.moderation('Timeout', interaction.user, target, reason)
            .setTitle('⏰ You have been timed out')
            .addFields(
              { name: 'Server', value: interaction.guild.name, inline: true },
              { name: 'Duration', value: CheckUtils.formatTime(duration), inline: true }
            );
          
          await target.send({ embeds: [dmEmbed] });
        } catch (error) {
          // DM failed, continue with timeout
        }
      }
      
      // Execute timeout
      await targetMember.timeout(duration, `${reason} | Moderator: ${interaction.user.tag}`);
      
      // Generate case ID
      const caseId = Date.now().toString().slice(-6);
      
      // Success embed
      const successEmbed = EmbedUtils.moderation('Timeout', interaction.user, target, reason, caseId, CheckUtils.formatTime(duration));
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Update stats
      client.incrementStat('moderationActions');
      
      // Log action
      logger.moderation(`${interaction.user.tag} timed out ${target.tag} for ${CheckUtils.formatTime(duration)}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        duration: CheckUtils.formatTime(duration),
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Timeout command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to timeout user. Please check my permissions and try again.')]
      });
    }
  }
};