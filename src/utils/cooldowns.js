const { Collection } = require('discord.js');
const ms = require('ms');

class CooldownManager {
  constructor() {
    this.cooldowns = new Collection();
  }

  setCooldown(userId, commandName, duration) {
    const key = `${userId}-${commandName}`;
    const expiresAt = Date.now() + duration;
    
    this.cooldowns.set(key, expiresAt);
    
    // Auto cleanup
    setTimeout(() => {
      this.cooldowns.delete(key);
    }, duration);
  }

  getCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const expiresAt = this.cooldowns.get(key);
    
    if (!expiresAt) return null;
    if (Date.now() >= expiresAt) {
      this.cooldowns.delete(key);
      return null;
    }
    
    return expiresAt - Date.now();
  }

  hasCooldown(userId, commandName) {
    return this.getCooldown(userId, commandName) !== null;
  }

  getRemainingTime(userId, commandName) {
    const remaining = this.getCooldown(userId, commandName);
    if (!remaining) return null;
    
    return this.formatTime(remaining);
  }

  formatTime(milliseconds) {
    if (milliseconds < 1000) return '1 second';
    
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  }

  clearCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    return this.cooldowns.delete(key);
  }

  clearUserCooldowns(userId) {
    const keys = this.cooldowns.keys();
    let cleared = 0;
    
    for (const key of keys) {
      if (key.startsWith(`${userId}-`)) {
        this.cooldowns.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }

  getCooldownInfo() {
    return {
      total: this.cooldowns.size,
      active: Array.from(this.cooldowns.entries()).map(([key, expiresAt]) => {
        const [userId, commandName] = key.split('-');
        return {
          userId,
          commandName,
          expiresAt,
          remaining: expiresAt - Date.now()
        };
      }).filter(cd => cd.remaining > 0)
    };
  }

  cleanup() {
    const now = Date.now();
    const toDelete = [];
    
    for (const [key, expiresAt] of this.cooldowns.entries()) {
      if (now >= expiresAt) {
        toDelete.push(key);
      }
    }
    
    toDelete.forEach(key => this.cooldowns.delete(key));
    return toDelete.length;
  }
}

module.exports = new CooldownManager();