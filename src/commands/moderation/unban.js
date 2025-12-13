const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server 🔓')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('The user ID to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  permission: config.levels.MODERATOR,
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const userId = interaction.options.getString('user_id');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason'));
    
    try {
      if (!CheckUtils.isValidSnowflake(userId)) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('Please provide a valid user ID!')]
        });
      }
      
      // Check if user is banned
      try {
        const banInfo = await interaction.guild.bans.fetch(userId);
        if (!banInfo) {
          return interaction.editReply({
            embeds: [EmbedUtils.error('This user is not banned!')]
          });
        }
      } catch (error) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This user is not banned!')]
        });
      }
      
      // Execute unban
      await interaction.guild.members.unban(userId, `${reason} | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      // Get user info
      let user;
      try {
        user = await client.users.fetch(userId);
      } catch (error) {
        user = { tag: 'Unknown User', id: userId };
      }
      
      const successEmbed = EmbedUtils.moderation('Unban', interaction.user, user, reason, caseId);
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} unbanned ${user.tag}`, {
        moderator: interaction.user.id,
        target: userId,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Unban command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to unban user. Please check the user ID and try again.')]
      });
    }
  }
};