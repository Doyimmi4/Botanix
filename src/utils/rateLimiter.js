const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('./logger');

class RateLimitManager {
  constructor() {
    // Command rate limiter
    this.commandLimiter = new RateLimiterMemory({
      keyPrefix: 'cmd',
      points: 10, // Number of commands
      duration: 60, // Per 60 seconds
    });

    // Moderation action limiter
    this.moderationLimiter = new RateLimiterMemory({
      keyPrefix: 'mod',
      points: 5, // Number of moderation actions
      duration: 60, // Per 60 seconds
    });

    // Global rate limiter
    this.globalLimiter = new RateLimiterMemory({
      keyPrefix: 'global',
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
    });
  }

  async checkCommandLimit(userId) {
    try {
      await this.commandLimiter.consume(userId);
      return { allowed: true };
    } catch (rejRes) {
      const msBeforeNext = rejRes.msBeforeNext || 1000;
      logger.warn(`Command rate limit exceeded for user ${userId}`, {
        msBeforeNext,
        totalHits: rejRes.totalHits,
        remainingPoints: rejRes.remainingPoints
      });
      
      return {
        allowed: false,
        retryAfter: Math.round(msBeforeNext / 1000),
        message: `Too many commands! Try again in ${Math.round(msBeforeNext / 1000)} seconds.`
      };
    }
  }

  async checkModerationLimit(userId) {
    try {
      await this.moderationLimiter.consume(userId);
      return { allowed: true };
    } catch (rejRes) {
      const msBeforeNext = rejRes.msBeforeNext || 1000;
      logger.warn(`Moderation rate limit exceeded for user ${userId}`, {
        msBeforeNext,
        totalHits: rejRes.totalHits
      });
      
      return {
        allowed: false,
        retryAfter: Math.round(msBeforeNext / 1000),
        message: `Too many moderation actions! Try again in ${Math.round(msBeforeNext / 1000)} seconds.`
      };
    }
  }

  async checkGlobalLimit(identifier) {
    try {
      await this.globalLimiter.consume(identifier);
      return { allowed: true };
    } catch (rejRes) {
      const msBeforeNext = rejRes.msBeforeNext || 1000;
      logger.warn(`Global rate limit exceeded for ${identifier}`, {
        msBeforeNext,
        totalHits: rejRes.totalHits
      });
      
      return {
        allowed: false,
        retryAfter: Math.round(msBeforeNext / 1000),
        message: `Rate limit exceeded! Try again in ${Math.round(msBeforeNext / 1000)} seconds.`
      };
    }
  }

  getStats() {
    return {
      commandLimiter: this.commandLimiter.totalHits,
      moderationLimiter: this.moderationLimiter.totalHits,
      globalLimiter: this.globalLimiter.totalHits
    };
  }
}

module.exports = new RateLimitManager();