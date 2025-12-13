const logger = require('../utils/logger');
const config = require('../config/bot');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.ready(client.user.tag, client.guilds.cache.size, client.users.cache.size);
    
    // Start presence manager
    client.presenceManager?.start();
    
    // Log shard info if sharded
    if (client.shard) {
      logger.shard(`Shard ${client.shard.ids.join(', ')} ready`);
    }
    
    // Start periodic tasks
    setInterval(() => {
      // Cleanup expired cooldowns
      const cleaned = require('../utils/cooldowns').cleanup();
      if (cleaned > 0) {
        logger.cache(`Cleaned ${cleaned} expired cooldowns`);
      }
    }, 300000); // 5 minutes
    
    // Update stats
    client.stats.startTime = Date.now();
    
    logger.kawaii('All systems ready! Time to spread love and order! 🌸💖');
  }
};