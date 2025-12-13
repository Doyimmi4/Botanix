const { glob } = require('glob');
const path = require('path');
const logger = require('../utils/logger');

class EventHandler {
  constructor(client) {
    this.client = client;
  }

  async load() {
    const eventFiles = await glob(path.join(__dirname, '../events/**/*.js'));
    
    for (const file of eventFiles) {
      try {
        delete require.cache[require.resolve(file)];
        const event = require(file);
        
        if (!event.name) {
          logger.warning(`Event file ${file} is missing a name property`);
          continue;
        }
        
        if (event.once) {
          this.client.once(event.name, (...args) => event.execute(...args, this.client));
        } else {
          this.client.on(event.name, (...args) => event.execute(...args, this.client));
        }
        
        this.client.events.set(event.name, event);
        logger.dev(`Loaded event: ${event.name}`);
      } catch (error) {
        logger.error(`Failed to load event ${file}:`, error);
      }
    }
    
    logger.system(`Loaded ${this.client.events.size} events`);
  }
}

module.exports = EventHandler;