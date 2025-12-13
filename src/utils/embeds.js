const { EmbedBuilder } = require('discord.js');
const config = require('../config/bot');
const emojis = require('../config/emojis');

class EmbedUtils {
  static success(description, title = null) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setDescription(`${emojis.success} ${description}`)
      .setTimestamp()
      .setFooter({ text: 'Botanix • Made with 💖', iconURL: null });
    
    if (title) embed.setTitle(title);
    return embed;
  }

  static error(description, title = null) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.error)
      .setDescription(`${emojis.error} ${description}`)
      .setTimestamp()
      .setFooter({ text: 'Botanix • Made with 💖', iconURL: null });
    
    if (title) embed.setTitle(title);
    return embed;
  }

  static warning(description, title = null) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setDescription(`${emojis.warning} ${description}`)
      .setTimestamp()
      .setFooter({ text: 'Botanix • Made with 💖', iconURL: null });
    
    if (title) embed.setTitle(title);
    return embed;
  }

  static info(description, title = null) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setDescription(`${emojis.info} ${description}`)
      .setTimestamp()
      .setFooter({ text: 'Botanix • Made with 💖', iconURL: null });
    
    if (title) embed.setTitle(title);
    return embed;
  }

  static moderation(action, executor, target, reason, caseId = null, duration = null) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.moderation)
      .setTitle(`${emojis[action.toLowerCase()] || emojis.moderation} ${action}`)
      .addFields(
        { name: 'Target', value: `${target.tag} (${target.id})`, inline: true },
        { name: 'Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
        { name: 'Reason', value: reason || 'No reason provided', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Botanix Moderation • Made with 💖', iconURL: null });

    if (duration) {
      embed.addFields({ name: 'Duration', value: duration, inline: true });
    }

    if (caseId) {
      embed.addFields({ name: 'Case ID', value: `#${caseId}`, inline: true });
    }

    if (target.displayAvatarURL) {
      embed.setThumbnail(target.displayAvatarURL({ dynamic: true }));
    }

    return embed;
  }

  static log(type, description, extra = {}) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle(`${emojis[type.toLowerCase()] || emojis.system} ${type.toUpperCase()} LOG`)
      .setDescription(description)
      .setTimestamp()
      .setFooter({ text: 'Botanix Logs • Made with 💖', iconURL: null });

    Object.entries(extra).forEach(([key, value]) => {
      if (value) {
        embed.addFields({ name: key, value: String(value), inline: true });
      }
    });

    return embed;
  }

  static ping(client, interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${emojis.botanix} Botanix Status`)
      .addFields(
        { name: '🏓 API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: '⏱️ Bot Latency', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
        { name: '🕐 Uptime', value: this.formatUptime(client.uptime), inline: true },
        { name: '💾 Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
        { name: '📊 Node.js', value: process.version, inline: true },
        { name: '📚 Discord.js', value: require('discord.js').version, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Botanix • Made with 💖', iconURL: null });

    return embed;
  }

  static formatUptime(uptime) {
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  static maintenance(message = null) {
    return new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle(`${emojis.warning} Maintenance Mode`)
      .setDescription(message || 'Botanix is currently under maintenance. Please try again later! 🌸')
      .setTimestamp()
      .setFooter({ text: 'Botanix • Made with 💖', iconURL: null });
  }
}

module.exports = EmbedUtils;