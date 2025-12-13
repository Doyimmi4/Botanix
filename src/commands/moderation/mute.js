const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const CheckUtils = require('../../utils/checks');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user (role-based) 🔇')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('silent')
        .setDescription('Don\'t send DM to user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ManageRoles],
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
      
      // Find or create mute role
      let muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
      
      if (!muteRole) {
        muteRole = await interaction.guild.roles.create({
          name: 'Muted',
          color: 0x808080,
          permissions: [],
          reason: 'Botanix mute role - automatically created'
        });
        
        // Set permissions for all channels
        for (const channel of interaction.guild.channels.cache.values()) {
          if (channel.isTextBased()) {
            await channel.permissionOverwrites.create(muteRole, {
              SendMessages: false,
              AddReactions: false
            });
          } else if (channel.isVoiceBased()) {
            await channel.permissionOverwrites.create(muteRole, {
              Speak: false
            });
          }
        }
      }
      
      // Check if already muted
      if (targetMember.roles.cache.has(muteRole.id)) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('This user is already muted!')]
        });
      }
      
      // Send DM before mute
      if (!silent) {
        try {
          const dmEmbed = EmbedUtils.moderation('Mute', interaction.user, target, reason)
            .setTitle('🔇 You have been muted')
            .addFields({ name: 'Server', value: interaction.guild.name, inline: true });
          
          await target.send({ embeds: [dmEmbed] });
        } catch (error) {
          // DM failed
        }
      }
      
      // Add mute role
      await targetMember.roles.add(muteRole, `${reason} | Moderator: ${interaction.user.tag}`);
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.moderation('Mute', interaction.user, target, reason, caseId);
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} muted ${target.tag}`, {
        moderator: interaction.user.id,
        target: target.id,
        reason,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Mute command error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to mute user. Please check my permissions and try again.')]
      });
    }
  }
};