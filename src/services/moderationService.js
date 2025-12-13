const { Collection } = require('discord.js');
const logger = require('../utils/logger');
const EmbedUtils = require('../utils/embeds');

class ModerationService {
  constructor(client) {
    this.client = client;
    this.cases = new Collection();
    this.warnings = new Collection();
  }

  generateCaseId() {
    return Date.now().toString().slice(-6);
  }

  async createCase(type, moderator, target, reason, duration = null, evidence = null) {
    const caseId = this.generateCaseId();
    const caseData = {
      id: caseId,
      type,
      moderator: {
        id: moderator.id,
        tag: moderator.tag
      },
      target: {
        id: target.id,
        tag: target.tag
      },
      reason,
      duration,
      evidence,
      timestamp: Date.now(),
      guild: moderator.guild?.id
    };

    this.cases.set(caseId, caseData);
    
    logger.moderation(`Case ${caseId} created: ${type}`, {
      moderator: moderator.id,
      target: target.id,
      reason
    });

    return caseData;
  }

  async addWarning(userId, guildId, moderatorId, reason) {
    const key = `${userId}-${guildId}`;
    const warnings = this.warnings.get(key) || [];
    
    const warning = {
      id: this.generateCaseId(),
      moderatorId,
      reason,
      timestamp: Date.now()
    };

    warnings.push(warning);
    this.warnings.set(key, warnings);

    return warning;
  }

  getWarnings(userId, guildId) {
    const key = `${userId}-${guildId}`;
    return this.warnings.get(key) || [];
  }

  clearWarnings(userId, guildId) {
    const key = `${userId}-${guildId}`;
    const warnings = this.warnings.get(key) || [];
    this.warnings.delete(key);
    return warnings.length;
  }

  getCase(caseId) {
    return this.cases.get(caseId);
  }

  async sendModerationDM(user, action, reason, guild, duration = null) {
    try {
      const embed = EmbedUtils.moderation(action, { tag: 'Botanix' }, user, reason)
        .setTitle(`${this.getActionEmoji(action)} You have been ${action.toLowerCase()}`)
        .addFields({ name: 'Server', value: guild.name, inline: true });

      if (duration) {
        embed.addFields({ name: 'Duration', value: duration, inline: true });
      }

      await user.send({ embeds: [embed] });
      return true;
    } catch (error) {
      logger.dev(`Failed to send DM to ${user.tag}:`, error.message);
      return false;
    }
  }

  getActionEmoji(action) {
    const emojis = {
      'ban': '🔨',
      'kick': '👢',
      'timeout': '⏰',
      'warn': '⚠️',
      'mute': '🔇'
    };
    return emojis[action.toLowerCase()] || '🛡️';
  }

  async checkAutoEscalation(userId, guildId) {
    const warnings = this.getWarnings(userId, guildId);
    const config = require('../config/bot');
    
    for (const [threshold, action] of Object.entries(config.warnPointThresholds)) {
      if (warnings.length >= parseInt(threshold)) {
        return action;
      }
    }
    
    return null;
  }

  async logModerationAction(action, moderator, target, reason, caseId, channel = null) {
    if (!channel) return;

    try {
      const embed = EmbedUtils.log('MODERATION', `${action} executed`)
        .addFields(
          { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
          { name: 'Target', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Case ID', value: caseId, inline: true }
        );

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error('Failed to log moderation action:', error);
    }
  }

  getStats() {
    return {
      totalCases: this.cases.size,
      totalWarnings: Array.from(this.warnings.values()).reduce((acc, warnings) => acc + warnings.length, 0),
      casesByType: this.getCasesByType()
    };
  }

  getCasesByType() {
    const types = {};
    for (const caseData of this.cases.values()) {
      types[caseData.type] = (types[caseData.type] || 0) + 1;
    }
    return types;
  }
}

module.exports = ModerationService;