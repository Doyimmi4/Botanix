const { SlashCommandBuilder, ActivityType } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('presence')
    .setDescription('Manage bot presence 🎭')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set custom presence')
        .addStringOption(option =>
          option.setName('activity')
            .setDescription('Activity text')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('type')
            .setDescription('Activity type')
            .addChoices(
              { name: 'Playing', value: 'playing' },
              { name: 'Watching', value: 'watching' },
              { name: 'Listening', value: 'listening' },
              { name: 'Competing', value: 'competing' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('auto')
        .setDescription('Enable automatic presence rotation'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Stop automatic presence rotation')),
  
  permission: config.levels.OWNER,
  cooldown: 0,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    try {
      switch (subcommand) {
        case 'set':
          const activity = interaction.options.getString('activity');
          const typeStr = interaction.options.getString('type') || 'playing';
          
          const typeMap = {
            'playing': ActivityType.Playing,
            'watching': ActivityType.Watching,
            'listening': ActivityType.Listening,
            'competing': ActivityType.Competing
          };
          
          client.presenceManager.stop();
          client.presenceManager.setCustomPresence(activity, typeMap[typeStr]);
          
          await interaction.editReply({
            embeds: [EmbedUtils.success(`Set presence to **${typeStr}** ${activity}`, '🎭 Presence Updated')]
          });
          break;
          
        case 'auto':
          client.presenceManager.start();
          
          await interaction.editReply({
            embeds: [EmbedUtils.success('Enabled automatic presence rotation', '🎭 Auto Presence')]
          });
          break;
          
        case 'stop':
          client.presenceManager.stop();
          
          await interaction.editReply({
            embeds: [EmbedUtils.success('Stopped automatic presence rotation', '🎭 Presence Stopped')]
          });
          break;
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error(`Failed to update presence: ${error.message}`)]
      });
    }
  }
};