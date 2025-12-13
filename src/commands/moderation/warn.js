const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member ⚠️')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('silent')
        .setDescription('Don\'t send DM to user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  permission: config.levels.MODERATOR,
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason'));
    const silent = interaction.options.getBoolean('silent') || false;
    
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
      
      if (!silent) {
        try {
          const dmEmbed = EmbedUtils.moderation('Warning', interaction.user, target, reason)
            .setTitle('⚠️ You have been warned')
            .addFields({ name: 'Server', value: interaction.guild.name, inline: true });
          
          await target.send({ embeds: [dmEmbed] });
        } catch (error) {
          // DM failed
        }
      }
      
      const caseId = Date.now().toString().slice(-6);
      const successEmbed = EmbedUtils.moderation('Warning', interaction.user, target, reason, caseId);
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} warned ${target.tag}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Warn command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to warn user. Please try again.')]
      });
    }
  }
};