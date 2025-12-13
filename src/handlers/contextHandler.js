const { REST, Routes } = require('discord.js');
const { glob } = require('glob');
const path = require('path');
const logger = require('../utils/logger');

class ContextHandler {
  constructor(client) {
    this.client = client;
    this.commands = [];
  }

  async load() {
    const contextFiles = await glob(path.join(__dirname, '../contexts/**/*.js'));
    
    for (const file of contextFiles) {
      try {
        delete require.cache[require.resolve(file)];
        const command = require(file);
        
        if (!command.data || !command.execute) {
          logger.warning(`Context menu file ${file} is missing required properties`);
          continue;
        }
        
        this.client.contextMenus.set(command.data.name, command);
        this.commands.push(command.data.toJSON());
        
        logger.dev(`Loaded context menu: ${command.data.name}`);
      } catch (error) {
        logger.error(`Failed to load context menu ${file}:`, error);
      }
    }
    
    // Commands are registered by main deployer
    
    logger.system(`Loaded ${this.client.contextMenus.size} context menus`);
  }

  async registerCommands() {
    // Commands are now deployed by the main deployer
    logger.dev('Skipping context menu registration - handled by main deployer');
  }
}

module.exports = ContextHandler;