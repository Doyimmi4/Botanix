const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View user warnings ⚠️')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check warnings for')
        .setRequired(true)),
  
  permission: config.levels.SUPPORT,
  cooldown: 5000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    
    try {
      // Get warnings from moderation service
      const moderationService = client.moderationService || new (require('../../services/moderationService'))(client);
      const warnings = moderationService.getWarnings(target.id, interaction.guild.id);
      
      if (warnings.length === 0) {
        const embed = EmbedUtils.info(
          `${target.tag} has no warnings in this server! 🌸`,
          '⚠️ User Warnings'
        );
        return interaction.editReply({ embeds: [embed] });
      }
      
      const embed = EmbedUtils.info('', `⚠️ Warnings for ${target.tag}`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Total Warnings', value: `${warnings.length}`, inline: true },
          { name: 'User ID', value: target.id, inline: true },
          { name: 'Server', value: interaction.guild.name, inline: true }
        );
      
      // Add warning details (max 10)
      const recentWarnings = warnings.slice(-10);
      for (let i = 0; i < recentWarnings.length; i++) {
        const warning = recentWarnings[i];
        const moderator = await client.users.fetch(warning.moderatorId).catch(() => ({ tag: 'Unknown' }));
        const date = new Date(warning.timestamp).toLocaleDateString();
        
        embed.addFields({
          name: `Warning #${warnings.length - recentWarnings.length + i + 1}`,
          value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator.tag}\n**Date:** ${date}`,
          inline: false
        });
      }
      
      if (warnings.length > 10) {
        embed.setFooter({ text: `Showing last 10 of ${warnings.length} warnings • Botanix` });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to fetch warnings. Please try again.')]
      });
    }
  }
};