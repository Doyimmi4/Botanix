const { REST, Routes } = require('discord.js');
const { glob } = require('glob');
const path = require('path');
const logger = require('./logger');
require('dotenv').config();

class CommandDeployer {
  constructor() {
    this.commands = [];
    this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  }

  async loadCommands() {
    logger.system('🔄 Loading commands for deployment...');
    
    // Load slash commands
    const commandFiles = await glob(path.join(__dirname, '../commands/**/*.js'));
    
    for (const file of commandFiles) {
      try {
        delete require.cache[require.resolve(file)];
        const command = require(file);
        
        if (command.data) {
          this.commands.push(command.data.toJSON());
          logger.dev(`✅ Loaded: ${command.data.name}`);
        }
      } catch (error) {
        logger.error(`❌ Failed to load ${file}:`, { error: error.message });
      }
    }
    
    // Load context menus
    const contextFiles = await glob(path.join(__dirname, '../contexts/**/*.js'));
    
    for (const file of contextFiles) {
      try {
        delete require.cache[require.resolve(file)];
        const command = require(file);
        
        if (command.data) {
          this.commands.push(command.data.toJSON());
          logger.dev(`✅ Loaded context: ${command.data.name}`);
        }
      } catch (error) {
        logger.error(`❌ Failed to load ${file}:`, { error: error.message });
      }
    }
    
    logger.success(`📦 Loaded ${this.commands.length} commands total`);
  }

  async deploy() {
    try {
      await this.loadCommands();
      
      logger.separator();
      logger.botanix(`🚀 Deploying ${this.commands.length} commands...`);
      
      // Simulate deployment progress
      for (let i = 0; i <= 100; i += 20) {
        logger.progress(i, 100, 'Deployment');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (process.env.TEST_GUILD_ID) {
        await this.rest.put(
          Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.TEST_GUILD_ID),
          { body: this.commands }
        );
        logger.kawaii(`✨ Successfully deployed to guild ${process.env.TEST_GUILD_ID}!`);
      } else {
        await this.rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID),
          { body: this.commands }
        );
        logger.uwu('🌍 Successfully deployed globally! (May take up to 1 hour)');
      }
      
      logger.separator();
      return true;
    } catch (error) {
      logger.error('💥 Failed to deploy commands:', { error: error.message });
      return false;
    }
  }
}

// If called directly
if (require.main === module) {
  const deployer = new CommandDeployer();
  deployer.deploy().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = CommandDeployer;