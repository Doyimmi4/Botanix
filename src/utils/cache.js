const NodeCache = require('node-cache');
const logger = require('./logger');

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false
    });
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
    
    // Event listeners
    this.cache.on('set', (key, value) => {
      this.stats.sets++;
      logger.debug(`Cache SET: ${key}`);
    });
    
    this.cache.on('del', (key, value) => {
      this.stats.deletes++;
      logger.debug(`Cache DEL: ${key}`);
    });
    
    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });
  }

  set(key, value, ttl = null) {
    return this.cache.set(key, value, ttl);
  }

  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }

  del(key) {
    return this.cache.del(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  keys() {
    return this.cache.keys();
  }

  getStats() {
    return {
      ...this.stats,
      keys: this.cache.keys().length,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  clear() {
    this.cache.flushAll();
    logger.cache('Cache cleared');
  }
}

module.exports = new CacheManager();