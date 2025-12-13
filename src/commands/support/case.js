const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Look up a moderation case 📋')
    .addStringOption(option =>
      option.setName('case_id')
        .setDescription('Case ID to look up')
        .setRequired(true)),
  
  permission: config.levels.SUPPORT,
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const caseId = interaction.options.getString('case_id').replace('#', '');
    
    try {
      // Get case from moderation service
      const moderationService = client.moderationService || new (require('../../services/moderationService'))(client);
      const caseData = moderationService.getCase(caseId);
      
      if (!caseData) {
        return interaction.editReply({
          embeds: [EmbedUtils.error(`Case #${caseId} not found!`)]
        });
      }
      
      const embed = EmbedUtils.info('', `📋 Case #${caseId}`)
        .addFields(
          { name: 'Type', value: caseData.type, inline: true },
          { name: 'Moderator', value: `${caseData.moderator.tag} (${caseData.moderator.id})`, inline: true },
          { name: 'Target', value: `${caseData.target.tag} (${caseData.target.id})`, inline: true },
          { name: 'Reason', value: caseData.reason, inline: false },
          { name: 'Date', value: new Date(caseData.timestamp).toLocaleString(), inline: true },
          { name: 'Guild', value: caseData.guild || 'Unknown', inline: true }
        );
      
      if (caseData.duration) {
        embed.addFields({ name: 'Duration', value: caseData.duration, inline: true });
      }
      
      if (caseData.evidence) {
        embed.addFields({ name: 'Evidence', value: caseData.evidence, inline: false });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to fetch case. Please try again.')]
      });
    }
  }
};