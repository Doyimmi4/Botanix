const { PermissionFlagsBits } = require('discord.js');
const PermissionUtils = require('./permissions');
const config = require('../config/bot');
const constants = require('./constants');

class CheckUtils {
  static parseUser(input, guild) {
    if (!input) return null;
    
    // Check if it's a mention
    const mentionMatch = input.match(constants.REGEX.USER_ID);
    if (mentionMatch) {
      return guild.members.cache.get(mentionMatch[1]);
    }
    
    // Check if it's a user ID
    if (/^\d{17,19}$/.test(input)) {
      return guild.members.cache.get(input);
    }
    
    // Check if it's a username or display name
    const member = guild.members.cache.find(m => 
      m.user.username.toLowerCase() === input.toLowerCase() ||
      m.displayName.toLowerCase() === input.toLowerCase() ||
      m.user.tag.toLowerCase() === input.toLowerCase()
    );
    
    return member || null;
  }

  static parseChannel(input, guild) {
    if (!input) return null;
    
    // Check if it's a mention
    const mentionMatch = input.match(constants.REGEX.CHANNEL_ID);
    if (mentionMatch) {
      return guild.channels.cache.get(mentionMatch[1]);
    }
    
    // Check if it's a channel ID
    if (/^\d{17,19}$/.test(input)) {
      return guild.channels.cache.get(input);
    }
    
    // Check if it's a channel name
    const channel = guild.channels.cache.find(c => 
      c.name.toLowerCase() === input.toLowerCase()
    );
    
    return channel || null;
  }

  static parseRole(input, guild) {
    if (!input) return null;
    
    // Check if it's a mention
    const mentionMatch = input.match(constants.REGEX.ROLE_ID);
    if (mentionMatch) {
      return guild.roles.cache.get(mentionMatch[1]);
    }
    
    // Check if it's a role ID
    if (/^\d{17,19}$/.test(input)) {
      return guild.roles.cache.get(input);
    }
    
    // Check if it's a role name
    const role = guild.roles.cache.find(r => 
      r.name.toLowerCase() === input.toLowerCase()
    );
    
    return role || null;
  }

  static parseTime(input) {
    if (!input) return null;
    
    const match = input.match(constants.REGEX.TIME);
    if (!match) return null;
    
    const [, amount, unit] = match;
    const num = parseInt(amount);
    
    if (isNaN(num) || num <= 0) return null;
    
    const multipliers = {
      s: constants.TIME.SECOND,
      sec: constants.TIME.SECOND,
      second: constants.TIME.SECOND,
      seconds: constants.TIME.SECOND,
      m: constants.TIME.MINUTE,
      min: constants.TIME.MINUTE,
      minute: constants.TIME.MINUTE,
      minutes: constants.TIME.MINUTE,
      h: constants.TIME.HOUR,
      hour: constants.TIME.HOUR,
      hours: constants.TIME.HOUR,
      d: constants.TIME.DAY,
      day: constants.TIME.DAY,
      days: constants.TIME.DAY,
      w: constants.TIME.WEEK,
      week: constants.TIME.WEEK,
      weeks: constants.TIME.WEEK
    };
    
    const multiplier = multipliers[unit.toLowerCase()];
    return multiplier ? num * multiplier : null;
  }

  static formatTime(milliseconds) {
    if (milliseconds < constants.TIME.MINUTE) {
      return `${Math.floor(milliseconds / constants.TIME.SECOND)} second(s)`;
    } else if (milliseconds < constants.TIME.HOUR) {
      return `${Math.floor(milliseconds / constants.TIME.MINUTE)} minute(s)`;
    } else if (milliseconds < constants.TIME.DAY) {
      return `${Math.floor(milliseconds / constants.TIME.HOUR)} hour(s)`;
    } else if (milliseconds < constants.TIME.WEEK) {
      return `${Math.floor(milliseconds / constants.TIME.DAY)} day(s)`;
    } else {
      return `${Math.floor(milliseconds / constants.TIME.WEEK)} week(s)`;
    }
  }

  static validateReason(reason) {
    if (!reason) return 'No reason provided';
    if (reason.length > constants.LIMITS.REASON_LENGTH) {
      return reason.substring(0, constants.LIMITS.REASON_LENGTH - 3) + '...';
    }
    return reason;
  }

  static canExecuteOn(executor, target, action = 'moderate') {
    // Cannot target yourself
    if (executor.id === target.id) {
      return { success: false, reason: constants.MESSAGES.SELF_ACTION };
    }
    
    // Check if target is a bot (only owners can moderate bots)
    if (target.user?.bot || target.bot) {
      const executorLevel = PermissionUtils.getPermissionLevel(executor);
      if (executorLevel < 5) { // Not owner
        return { success: false, reason: constants.MESSAGES.BOT_ACTION };
      }
    }
    
    // Check permission hierarchy
    if (!PermissionUtils.canModerate(executor, target)) {
      return { success: false, reason: constants.MESSAGES.HIERARCHY_ERROR };
    }
    
    return { success: true };
  }

  static validatePermissions(member, channel, requiredPerms) {
    const missing = [];
    
    for (const perm of requiredPerms) {
      if (!member.permissionsIn(channel).has(perm)) {
        missing.push(perm);
      }
    }
    
    if (missing.length > 0) {
      return {
        success: false,
        missing: PermissionUtils.formatPermissions(missing)
      };
    }
    
    return { success: true };
  }

  static isValidSnowflake(id) {
    return /^\d{17,19}$/.test(id);
  }

  static isValidUrl(url) {
    return constants.REGEX.URL.test(url);
  }

  static isInviteLink(text) {
    return constants.REGEX.INVITE.test(text);
  }

  static extractUrls(text) {
    return text.match(constants.REGEX.URL) || [];
  }

  static extractInvites(text) {
    return text.match(constants.REGEX.INVITE) || [];
  }

  static sanitizeInput(input, maxLength = 1000) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>@#&!]/g, '') // Remove potential mention characters
      .substring(0, maxLength)
      .trim();
  }
}

module.exports = CheckUtils;