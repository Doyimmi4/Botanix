const { REST, Routes } = require('discord.js');
const { glob } = require('glob');
const path = require('path');
const logger = require('../utils/logger');

class SlashHandler {
  constructor(client) {
    this.client = client;
    this.commands = [];
  }

  async load() {
    const commandFiles = await glob(path.join(__dirname, '../commands/**/*.js'));
    
    for (const file of commandFiles) {
      try {
        delete require.cache[require.resolve(file)];
        const command = require(file);
        
        if (!command.data || !command.execute) {
          logger.warning(`Command file ${file} is missing required properties`);
          continue;
        }
        
        this.client.slashCommands.set(command.data.name, command);
        this.commands.push(command.data.toJSON());
        
        logger.dev(`Loaded slash command: ${command.data.name}`);
      } catch (error) {
        logger.error(`Failed to load command ${file}:`, error);
      }
    }
    
    // Commands are registered by main deployer
    
    logger.system(`Loaded ${this.client.slashCommands.size} slash commands`);
  }

  async registerCommands() {
    // Commands are now deployed by the main deployer
    logger.dev('Skipping command registration - handled by main deployer');
  }

  async reloadCommand(commandName) {
    try {
      // Find command file
      const commandFiles = await glob(path.join(__dirname, '../commands/**/*.js'));
      const commandFile = commandFiles.find(file => {
        const command = require(file);
        return command.data?.name === commandName;
      });
      
      if (!commandFile) {
        return { success: false, error: 'Command not found' };
      }
      
      // Clear cache and reload
      delete require.cache[require.resolve(commandFile)];
      const command = require(commandFile);
      
      // Update collections
      this.client.slashCommands.set(command.data.name, command);
      
      // Update commands array
      const index = this.commands.findIndex(cmd => cmd.name === commandName);
      if (index !== -1) {
        this.commands[index] = command.data.toJSON();
      }
      
      logger.dev(`Reloaded command: ${commandName}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to reload command ${commandName}:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SlashHandler;