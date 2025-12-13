const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const PermissionUtils = require('../../utils/permissions');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server 🔨')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('delete_days')
        .setDescription('Days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7))
    .addBooleanOption(option =>
      option.setName('silent')
        .setDescription('Don\'t send DM to user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.BanMembers],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason'));
    const deleteDays = interaction.options.getInteger('delete_days') || 0;
    const silent = interaction.options.getBoolean('silent') || false;
    
    try {
      // Get member if in guild
      let targetMember = null;
      try {
        targetMember = await interaction.guild.members.fetch(target.id);
      } catch (error) {
        // User not in guild, can still ban by ID
      }
      
      // Check if user can be moderated
      if (targetMember) {
        const canExecute = CheckUtils.canExecuteOn(interaction.member, targetMember);
        if (!canExecute.success) {
          return interaction.editReply({
            embeds: [EmbedUtils.error(canExecute.reason)]
          });
        }
      }
      
      // Check if already banned
      try {
        const banInfo = await interaction.guild.bans.fetch(target.id);
        if (banInfo) {
          return interaction.editReply({
            embeds: [EmbedUtils.error('This user is already banned!')]
          });
        }
      } catch (error) {
        // User not banned, continue
      }
      
      // Send DM before ban (if not silent and user is in guild)
      if (!silent && targetMember) {
        try {
          const dmEmbed = EmbedUtils.moderation('Ban', interaction.user, target, reason)
            .setTitle('🔨 You have been banned')
            .addFields({ name: 'Server', value: interaction.guild.name, inline: true });
          
          await target.send({ embeds: [dmEmbed] });
        } catch (error) {
          // DM failed, continue with ban
        }
      }
      
      // Execute ban
      await interaction.guild.members.ban(target.id, {
        reason: `${reason} | Moderator: ${interaction.user.tag}`,
        deleteMessageDays: deleteDays
      });
      
      // Generate case ID
      const caseId = Date.now().toString().slice(-6);
      
      // Success embed
      const successEmbed = EmbedUtils.moderation('Ban', interaction.user, target, reason, caseId)
        .addFields({ name: 'Messages Deleted', value: `${deleteDays} day(s)`, inline: true });
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Update stats
      client.incrementStat('moderationActions');
      
      // Log action
      logger.moderation(`${interaction.user.tag} banned ${target.tag}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Ban command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to ban user. Please check my permissions and try again.')]
      });
    }
  }
};