const { Client, Collection } = require('discord.js');
const config = require('./config/bot');
const logger = require('./utils/logger');

class BotanixClient extends Client {
  constructor() {
    super({
      intents: config.intents,
      partials: config.partials,
      presence: config.presence,
      allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false
      },
      rest: {
        timeout: 15000,
        retries: 3
      }
    });

    // Collections
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.contextMenus = new Collection();
    this.events = new Collection();
    this.cooldowns = new Collection();
    
    // Stores
    this.guildSettings = new Collection();
    this.userCases = new Collection();
    this.automodViolations = new Collection();
    
    // Managers
    this.maintenanceMode = false;
    this.maintenanceMessage = process.env.MAINTENANCE_MESSAGE || config.maintenanceMessage;
    
    // Statistics
    this.stats = {
      commandsExecuted: 0,
      moderationActions: 0,
      automodActions: 0,
      startTime: Date.now()
    };

    // Error handling
    this.on('error', (error) => {
      logger.error('Client error:', error);
    });

    this.on('warn', (warning) => {
      logger.warn('Client warning:', warning);
    });

    this.on('debug', (info) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Client debug:', info);
      }
    });

    // Shard events
    this.on('shardError', (error, shardId) => {
      logger.shard(`Shard ${shardId} error:`, { error: error.message });
    });

    this.on('shardReady', (shardId) => {
      logger.shard(`Shard ${shardId} ready`);
    });

    this.on('shardReconnecting', (shardId) => {
      logger.shard(`Shard ${shardId} reconnecting`);
    });

    this.on('shardDisconnect', (event, shardId) => {
      logger.shard(`Shard ${shardId} disconnected`, { event });
    });
  }

  async start() {
    try {
      // Deploy commands first (skip in production if already deployed)
      if (process.env.NODE_ENV !== 'production' || !process.env.SKIP_DEPLOY) {
        logger.system('🚀 Deploying commands before startup...');
        const CommandDeployer = require('./utils/deploy');
        const deployer = new CommandDeployer();
        await deployer.deploy();
      } else {
        logger.system('⚙️ Skipping command deployment in production');
      }
      
      // Load handlers
      await this.loadHandlers();
      
      // Login
      await this.login(process.env.DISCORD_TOKEN);
      
      logger.uwu('Botanix started successfully! Ready to be the cutest moderator! 🌸💖');
    } catch (error) {
      logger.error('Failed to start Botanix:', error);
      process.exit(1);
    }
  }

  async loadHandlers() {
    const handlers = [
      { path: './handlers/eventHandler', name: 'Event Handler' },
      { path: './handlers/commandHandler', name: 'Command Handler' },
      { path: './handlers/slashHandler', name: 'Slash Handler' },
      { path: './handlers/contextHandler', name: 'Context Handler' },
      { path: './handlers/errorHandler', name: 'Error Handler' }
    ];

    logger.system('Loading handlers...');
    
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      logger.progress(i, handlers.length, 'Handlers');
      
      try {
        const HandlerClass = require(handler.path);
        const handlerInstance = new HandlerClass(this);
        await handlerInstance.load();
        logger.success(`✨ ${handler.name} loaded successfully`);
      } catch (error) {
        logger.error(`💥 Failed to load ${handler.name}:`, { error: error.message });
      }
    }
    
    logger.progress(handlers.length, handlers.length, 'Handlers');
    logger.kawaii('All handlers loaded with love! 💖');
  }

  async reload() {
    try {
      // Clear collections
      this.commands.clear();
      this.slashCommands.clear();
      this.contextMenus.clear();
      this.events.clear();
      
      // Clear require cache
      Object.keys(require.cache).forEach(key => {
        if (key.includes('/commands/') || key.includes('/events/') || key.includes('/handlers/')) {
          delete require.cache[key];
        }
      });
      
      // Reload handlers
      await this.loadHandlers();
      
      logger.system('Botanix reloaded successfully');
      return true;
    } catch (error) {
      logger.error('Failed to reload Botanix:', error);
      return false;
    }
  }

  setMaintenanceMode(enabled, message = null) {
    this.maintenanceMode = enabled;
    if (message) this.maintenanceMessage = message;
    
    // Update presence
    if (enabled) {
      this.presenceManager?.stop();
      this.presenceManager?.setMaintenancePresence();
    } else {
      this.presenceManager?.start();
    }
    
    logger.system(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  getUptime() {
    return Date.now() - this.stats.startTime;
  }

  incrementStat(stat) {
    if (this.stats.hasOwnProperty(stat)) {
      this.stats[stat]++;
    }
  }

  getStats() {
    return {
      ...this.stats,
      uptime: this.getUptime(),
      guilds: this.guilds.cache.size,
      users: this.users.cache.size,
      channels: this.channels.cache.size,
      ping: this.ws.ping,
      memoryUsage: process.memoryUsage()
    };
  }
}

module.exports = BotanixClient;