const logger = require('./logger');
const cache = require('./cache');
const rateLimiter = require('./rateLimiter');
const prettyBytes = require('pretty-bytes');
const humanizeDuration = require('humanize-duration');

class SystemMonitor {
  constructor(client) {
    this.client = client;
    this.startTime = Date.now();
    this.metrics = {
      commands: 0,
      errors: 0,
      warnings: 0,
      moderationActions: 0
    };
  }

  start() {
    logger.system('🔍 Starting system monitor...');
    
    // Monitor every 5 minutes
    setInterval(() => {
      this.collectMetrics();
    }, 300000);
    
    // Log stats every hour
    setInterval(() => {
      this.logStats();
    }, 3600000);
  }

  collectMetrics() {
    const memUsage = process.memoryUsage();
    const cacheStats = cache.getStats();
    
    logger.debug('System metrics collected', {
      memory: {
        heapUsed: prettyBytes(memUsage.heapUsed),
        heapTotal: prettyBytes(memUsage.heapTotal),
        rss: prettyBytes(memUsage.rss)
      },
      cache: cacheStats,
      uptime: humanizeDuration(Date.now() - this.startTime)
    });
  }

  logStats() {
    const stats = this.getSystemStats();
    
    logger.box(
      `📊 System Statistics\n\n` +
      `Uptime: ${stats.uptime}\n` +
      `Memory: ${stats.memory.used}/${stats.memory.total}\n` +
      `Commands: ${stats.commands}\n` +
      `Guilds: ${stats.guilds}\n` +
      `Cache Hit Rate: ${(stats.cache.hitRate * 100).toFixed(1)}%`,
      { borderColor: '#98FB98' }
    );
  }

  getSystemStats() {
    const memUsage = process.memoryUsage();
    const cacheStats = cache.getStats();
    
    return {
      uptime: humanizeDuration(Date.now() - this.startTime, { round: true }),
      memory: {
        used: prettyBytes(memUsage.heapUsed),
        total: prettyBytes(memUsage.heapTotal),
        rss: prettyBytes(memUsage.rss)
      },
      cache: cacheStats,
      commands: this.client?.slashCommands?.size || 0,
      guilds: this.client?.guilds?.cache?.size || 0,
      users: this.client?.users?.cache?.size || 0,
      ping: this.client?.ws?.ping || 0
    };
  }

  incrementMetric(metric) {
    if (this.metrics.hasOwnProperty(metric)) {
      this.metrics[metric]++;
    }
  }
}

module.exports = SystemMonitor;