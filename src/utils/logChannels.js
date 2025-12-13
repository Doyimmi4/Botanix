const { PermissionFlagsBits, ChannelType } = require('discord.js');
const { LOG_CATEGORY_NAME, LOG_CHANNELS } = require('../config/bot');
const logger = require('./logger');

const cache = new Map(); // guildId -> { channelName: channelId }

async function ensureCategory(guild) {
  let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === LOG_CATEGORY_NAME);
  if (!category) {
    category = await guild.channels.create({
      name: LOG_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
        { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory] },
      ],
      reason: 'Botanix logging category setup',
    }).catch(() => null);
  }
  return category;
}

async function ensureChannels(guild, category) {
  const mapping = {};
  for (const name of LOG_CHANNELS) {
    let ch = guild.channels.cache.find(c => c.parentId === category.id && c.name === name);
    if (!ch) {
      ch = await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory] },
        ],
        reason: `Botanix log channel: ${name}`,
      }).catch(() => null);
    }
    if (ch) mapping[name] = ch.id;
  }
  cache.set(guild.id, mapping);
  return mapping;
}

module.exports = {
  async ensureGuildLogChannels(guild) {
    try {
      const cat = await ensureCategory(guild);
      if (!cat) return null;
      return await ensureChannels(guild, cat);
    } catch (err) {
      logger.error({ err, guild: guild.name }, 'Failed ensuring log channels');
      return null;
    }
  },
  async fetch(guild, channelName) {
    const cached = cache.get(guild.id);
    let channelId = cached?.[channelName];
    if (!channelId) {
      const mapping = await this.ensureGuildLogChannels(guild);
      channelId = mapping?.[channelName];
    }
    if (!channelId) return null;
    return guild.channels.cache.get(channelId) || guild.channels.fetch(channelId).catch(() => null);
  }
};
