const ms = require('ms');
const logger = require('./logger');
const embeds = require('./embeds');
const logChannels = require('./logChannels');

// Simple in-memory configs and state; in production replace with DB
const state = {
  guild: {}
};

const defaultConfig = {
  enabled: true,
  rules: {
    spam: { threshold: 6, per: 7, action: 'timeout', duration: 10 * 60 * 1000 },
    mentions: { max: 5, action: 'delete' },
    links: { blockInvites: true, blockLinks: false, action: 'delete' },
    emoji: { max: 8, action: 'delete' },
    caps: { maxPercent: 70, minLength: 12, action: 'warn' },
    blacklist: { words: [], regex: [], action: 'delete' },
  },
  strikes: { warn: 2, timeout: 4, mute: 6 },
  whitelist: { channels: [], roles: [], users: [] }
};

const recent = new Map(); // message count per user id per guild

async function logAutomod(guild, data) {
  const channel = await logChannels.fetch(guild, 'automod-logs');
  const embed = embeds.info('AutoMod trigger', `Rule: **${data.rule}**\nUser: <@${data.userId}>\nAction: **${data.action}**\nReason: ${data.reason || '—'}`);
  embed.addFields(
    { name: 'Message', value: data.content?.slice(0, 350) || '—' },
    { name: 'Strikes', value: String(data.strikes || 0), inline: true },
  );
  channel?.send({ embeds: [embed] }).catch(() => {});
}

function getConfig(gid) {
  if (!state.guild[gid]) state.guild[gid] = JSON.parse(JSON.stringify(defaultConfig));
  return state.guild[gid];
}

function isWhitelisted(cfg, message) {
  if (cfg.whitelist.users.includes(message.author.id)) return true;
  if (cfg.whitelist.channels.includes(message.channel.id)) return true;
  if (message.member?.roles?.cache?.some(r => cfg.whitelist.roles.includes(r.id))) return true;
  return false;
}

function incrRecent(gid, uid) {
  const key = gid + ':' + uid;
  const now = Date.now();
  const arr = recent.get(key) || [];
  arr.push(now);
  const window = 7000; // 7s
  while (arr.length && now - arr[0] > window) arr.shift();
  recent.set(key, arr);
  return arr.length;
}

async function applyAction(message, action, duration, reason) {
  const me = message.guild.members.me;
  try {
    if (action === 'delete') {
      await message.delete().catch(() => {});
    } else if (action === 'warn') {
      await message.reply({ content: `⚠️ Please slow down, <@${message.author.id}>. ${reason || ''}` }).catch(() => {});
    } else if (action === 'timeout') {
      if (me.permissions.has('ModerateMembers')) {
        await message.member.timeout(duration || 10 * 60 * 1000, reason || 'Automod timeout');
      }
    }
  } catch (err) {
    logger.warn({ err }, 'Automod action failed');
  }
}

module.exports = {
  getConfig,
  async processMessage(client, message) {
    const cfg = getConfig(message.guild.id);
    if (!cfg.enabled) return;
    if (isWhitelisted(cfg, message)) return;

    const content = message.content || '';

    // Anti-spam
    const count = incrRecent(message.guild.id, message.author.id);
    if (count >= cfg.rules.spam.threshold) {
      await applyAction(message, cfg.rules.spam.action, cfg.rules.spam.duration, 'Spam detected');
      await logAutomod(message.guild, { rule: 'spam', userId: message.author.id, action: cfg.rules.spam.action, reason: 'Spam', content });
      return;
    }

    // Anti-mentions
    const mentions = (content.match(/<@!?\d+>/g) || []).length + (content.match(/@everyone|@here/g) || []).length;
    if (mentions > cfg.rules.mentions.max) {
      await applyAction(message, cfg.rules.mentions.action, null, 'Mass mention');
      await logAutomod(message.guild, { rule: 'mentions', userId: message.author.id, action: cfg.rules.mentions.action, reason: 'Mass mention', content });
      return;
    }

    // Anti-link / invite
    if (cfg.rules.links.blockInvites && /discord\.(gg|com\/invite)\//i.test(content)) {
      await applyAction(message, cfg.rules.links.action, null, 'Invite detected');
      await logAutomod(message.guild, { rule: 'invite', userId: message.author.id, action: cfg.rules.links.action, reason: 'Invite', content });
      return;
    }
    if (cfg.rules.links.blockLinks && /https?:\/\//i.test(content)) {
      await applyAction(message, cfg.rules.links.action, null, 'Link detected');
      await logAutomod(message.guild, { rule: 'link', userId: message.author.id, action: cfg.rules.links.action, reason: 'Link', content });
      return;
    }

    // Emoji spam
    const emojis = (content.match(/<a?:\w+:\d+>/g) || []).length;
    if (emojis > cfg.rules.emoji.max) {
      await applyAction(message, cfg.rules.emoji.action, null, 'Emoji spam');
      await logAutomod(message.guild, { rule: 'emoji', userId: message.author.id, action: cfg.rules.emoji.action, reason: 'Emoji spam', content });
      return;
    }

    // Caps
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length >= cfg.rules.caps.minLength) {
      const caps = letters.replace(/[^A-Z]/g, '').length;
      const pct = (caps / letters.length) * 100;
      if (pct >= cfg.rules.caps.maxPercent) {
        await applyAction(message, cfg.rules.caps.action, null, 'Excessive caps');
        await logAutomod(message.guild, { rule: 'caps', userId: message.author.id, action: cfg.rules.caps.action, reason: 'Excessive caps', content });
        return;
      }
    }

    // Blacklist
    const bl = cfg.rules.blacklist;
    if (bl.words.length && bl.words.some(w => content.toLowerCase().includes(w.toLowerCase()))) {
      await applyAction(message, bl.action, null, 'Blacklisted word');
      await logAutomod(message.guild, { rule: 'blacklist', userId: message.author.id, action: bl.action, reason: 'Blacklisted word', content });
      return;
    }
    if (bl.regex.length && bl.regex.some(rx => new RegExp(rx, 'i').test(content))) {
      await applyAction(message, bl.action, null, 'Blacklisted pattern');
      await logAutomod(message.guild, { rule: 'blacklist-regex', userId: message.author.id, action: bl.action, reason: 'Blacklisted pattern', content });
      return;
    }
  },
  async processJoin(client, member) {
    // Simple raid detection: high join rate can be implemented with shared counter; placeholder
    // For now we just ensure log channels on join handled elsewhere
  }
};
