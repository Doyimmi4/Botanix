const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test command to verify bot is working 🌸'),
  
  cooldown: 0,
  defer: true,
  ephemeral: false,
  
  async execute(interaction, client) {
    const embed = EmbedUtils.success('Botanix is working perfectly! 🌸', 'Test Successful');
    await interaction.editReply({ embeds: [embed] });
  }
};