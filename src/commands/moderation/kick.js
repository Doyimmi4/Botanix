const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const PermissionUtils = require('../../utils/permissions');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server 👢')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('silent')
        .setDescription('Don\'t send DM to user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.KickMembers],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason'));
    const silent = interaction.options.getBoolean('silent') || false;
    
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
      
      // Send DM before kick (if not silent)
      if (!silent) {
        try {
          const dmEmbed = EmbedUtils.moderation('Kick', interaction.user, target, reason)
            .setTitle('👢 You have been kicked')
            .addFields({ name: 'Server', value: interaction.guild.name, inline: true });
          
          await target.send({ embeds: [dmEmbed] });
        } catch (error) {
          // DM failed, continue with kick
        }
      }
      
      // Execute kick
      await targetMember.kick(`${reason} | Moderator: ${interaction.user.tag}`);
      
      // Generate case ID
      const caseId = Date.now().toString().slice(-6);
      
      // Success embed
      const successEmbed = EmbedUtils.moderation('Kick', interaction.user, target, reason, caseId);
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Update stats
      client.incrementStat('moderationActions');
      
      // Log action
      logger.moderation(`${interaction.user.tag} kicked ${target.tag}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Kick command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to kick user. Please check my permissions and try again.')]
      });
    }
  }
};