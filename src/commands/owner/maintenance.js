const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const PermissionUtils = require('../../utils/permissions');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Toggle maintenance mode 🔧')
    .addBooleanOption(option =>
      option.setName('enabled')
        .setDescription('Enable or disable maintenance mode')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Custom maintenance message')),
  
  permission: config.levels.OWNER,
  cooldown: 0,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const enabled = interaction.options.getBoolean('enabled');
    const message = interaction.options.getString('message');
    
    // Set maintenance mode
    client.setMaintenanceMode(enabled, message);
    
    const embed = EmbedUtils.success(
      `Maintenance mode ${enabled ? 'enabled' : 'disabled'}${message ? `\nMessage: ${message}` : ''}`,
      '🔧 Maintenance Mode'
    );
    
    await interaction.editReply({ embeds: [embed] });
  }
};