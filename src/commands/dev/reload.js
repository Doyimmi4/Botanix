const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload bot components 🔄')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('What to reload')
        .setRequired(true)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Commands', value: 'commands' },
          { name: 'Events', value: 'events' },
          { name: 'Handlers', value: 'handlers' }
        )),
  
  permission: config.levels.DEV,
  cooldown: 0,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const type = interaction.options.getString('type');
    
    try {
      const startTime = Date.now();
      
      switch (type) {
        case 'all':
          await client.reload();
          break;
          
        case 'commands':
          // Clear command collections
          client.slashCommands.clear();
          client.contextMenus.clear();
          
          // Reload handlers
          const SlashHandler = require('../../handlers/slashHandler');
          const ContextHandler = require('../../handlers/contextHandler');
          
          const slashHandler = new SlashHandler(client);
          const contextHandler = new ContextHandler(client);
          
          await slashHandler.load();
          await contextHandler.load();
          break;
          
        case 'events':
          // Clear events
          client.events.clear();
          client.removeAllListeners();
          
          // Reload event handler
          const EventHandler = require('../../handlers/eventHandler');
          const eventHandler = new EventHandler(client);
          await eventHandler.load();
          break;
          
        case 'handlers':
          await client.loadHandlers();
          break;
          
        default:
          return interaction.editReply({
            embeds: [EmbedUtils.error('Invalid reload type!')]
          });
      }
      
      const endTime = Date.now();
      
      const embed = EmbedUtils.success(
        `Successfully reloaded ${type}!`,
        '🔄 Reload Complete'
      ).addFields(
        { name: 'Type', value: type, inline: true },
        { name: 'Time Taken', value: `${endTime - startTime}ms`, inline: true },
        { name: 'Commands', value: `${client.slashCommands.size}`, inline: true },
        { name: 'Events', value: `${client.events.size}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error(`Failed to reload ${type}: ${error.message}`)]
      });
    }
  }
};