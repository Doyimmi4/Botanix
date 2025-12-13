const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage user roles 🎭')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to a user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User to add role to')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to add')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for adding role')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from a user')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('User to remove role from')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to remove')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for removing role')))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageRoles],
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const reason = CheckUtils.validateReason(interaction.options.getString('reason') || `Role ${subcommand}`);
    
    try {
      const targetMember = await interaction.guild.members.fetch(target.id);
      if (!targetMember) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('User is not in this server!')]
        });
      }
      
      // Check role hierarchy
      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('You cannot manage this role due to role hierarchy!')]
        });
      }
      
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('I cannot manage this role due to role hierarchy!')]
        });
      }
      
      // Check if role is managed
      if (role.managed) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This role is managed by an integration and cannot be assigned manually!')]
        });
      }
      
      const caseId = Date.now().toString().slice(-6);
      
      if (subcommand === 'add') {
        if (targetMember.roles.cache.has(role.id)) {
          return interaction.editReply({
            embeds: [EmbedUtils.error('User already has this role!')]
          });
        }
        
        await targetMember.roles.add(role, `${reason} | Moderator: ${interaction.user.tag}`);
        
        const successEmbed = EmbedUtils.success(
          `Successfully added ${role} to ${target.tag}`,
          '🎭 Role Added'
        ).addFields(
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Role', value: role.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Case ID', value: `#${caseId}`, inline: true }
        );
        
        await interaction.editReply({ embeds: [successEmbed] });
        
        logger.moderation(`${interaction.user.tag} added role ${role.name} to ${target.tag}`, {
          moderator: interaction.user.id,
          target: target.id,
          role: role.id,
          action: 'add',
          reason,
          caseId,
          guild: interaction.guild.id
        });
        
      } else if (subcommand === 'remove') {
        if (!targetMember.roles.cache.has(role.id)) {
          return interaction.editReply({
            embeds: [EmbedUtils.error('User does not have this role!')]
          });
        }
        
        await targetMember.roles.remove(role, `${reason} | Moderator: ${interaction.user.tag}`);
        
        const successEmbed = EmbedUtils.success(
          `Successfully removed ${role} from ${target.tag}`,
          '🎭 Role Removed'
        ).addFields(
          { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Role', value: role.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Case ID', value: `#${caseId}`, inline: true }
        );
        
        await interaction.editReply({ embeds: [successEmbed] });
        
        logger.moderation(`${interaction.user.tag} removed role ${role.name} from ${target.tag}`, {
          moderator: interaction.user.id,
          target: target.id,
          role: role.id,
          action: 'remove',
          reason,
          caseId,
          guild: interaction.guild.id
        });
      }
      
      client.incrementStat('moderationActions');
      
    } catch (error) {
      logger.error('Role command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to manage role. Please check my permissions and try again.')]
      });
    }
  }
};