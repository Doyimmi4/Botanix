const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user 🔊')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to unmute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unmute'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageRoles],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || 'Unmuted');
    
    try {
      const targetMember = await interaction.guild.members.fetch(target.id);
      if (!targetMember) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('User is not in this server!')]
        });
      }
      
      // Find mute role
      const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
      
      if (!muteRole) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('No mute role found in this server!')]
        });
      }
      
      // Check if user is muted
      if (!targetMember.roles.cache.has(muteRole.id)) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This user is not muted!')]
        });
      }
      
      // Remove mute role
      await targetMember.roles.remove(muteRole, `${reason} | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.moderation('Unmute', interaction.user, target, reason, caseId);
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      // Send DM
      try {
        const dmEmbed = EmbedUtils.moderation('Unmute', interaction.user, target, reason)
          .setTitle('🔊 You have been unmuted')
          .addFields({ name: 'Server', value: interaction.guild.name, inline: true });
        
        await target.send({ embeds: [dmEmbed] });
      } catch (error) {
        // DM failed
      }
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} unmuted ${target.tag}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Unmute command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to unmute user. Please check my permissions and try again.')]
      });
    }
  }
};