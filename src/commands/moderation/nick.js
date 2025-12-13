const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change a user\'s nickname 📝')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to change nickname')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('New nickname (leave empty to reset)')
        .setMaxLength(32))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for nickname change'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageNicknames],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || 'Nickname changed');
    
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
      
      const oldNick = targetMember.displayName;
      await targetMember.setNickname(nickname, `${reason} | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.success(
        `Successfully ${nickname ? 'changed' : 'reset'} ${target.tag}'s nickname`,
        '📝 Nickname Updated'
      ).addFields(
        { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Old Nickname', value: oldNick, inline: true },
        { name: 'New Nickname', value: nickname || target.username, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Case ID', value: `#${caseId}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} changed ${target.tag}'s nickname`, {
        moderator: interaction.user.id,
        target: target.id,
        oldNick,
        newNick: nickname || target.username,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Nick command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to change nickname. Please check my permissions and try again.')]
      });
    }
  }
};