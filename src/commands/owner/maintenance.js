const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');
const botConfig = require('../../config/bot');
const fs = require('fs');
const path = require('path');

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
        .setDescription('Custom maintenance message'))
    .addBooleanOption(option =>
      option.setName('send_message')
        .setDescription('Send message to users when commands are used during maintenance')
        .setRequired(false)),
  
  permission: config.levels.OWNER,
  cooldown: 0,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const enabled = interaction.options.getBoolean('enabled');
    const message = interaction.options.getString('message');
    const sendMessage = interaction.options.getBoolean('send_message');
    
    // Update .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(/MAINTENANCE_MODE=.*/g, `MAINTENANCE_MODE=${enabled}`);
    if (message) {
      envContent = envContent.replace(/MAINTENANCE_MESSAGE=.*/g, `MAINTENANCE_MESSAGE=${message}`);
    }
    if (sendMessage !== null) {
      envContent = envContent.replace(/MAINTENANCE_SEND_MESSAGE=.*/g, `MAINTENANCE_SEND_MESSAGE=${sendMessage}`);
    }
    
    fs.writeFileSync(envPath, envContent);
    
    // Update runtime config
    botConfig.maintenance.enabled = enabled;
    if (message) botConfig.maintenance.message = message;
    if (sendMessage !== null) botConfig.maintenance.sendMessage = sendMessage;
    
    const embed = EmbedUtils.success(
      `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` +
      `${message ? `\nMessage: ${message}` : ''}` +
      `${sendMessage !== null ? `\nSend messages: ${sendMessage}` : ''}`,
      '🔧 Maintenance Mode'
    );
    
    await interaction.editReply({ embeds: [embed] });
  }
};