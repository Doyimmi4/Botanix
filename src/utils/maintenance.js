const config = require('../config/maintenance');
const embeds = require('./embeds');
const owners = require('../config/owners');

function isBypassed(userId) {
  return owners.owners.includes(userId) || owners.developers.includes(userId);
}

module.exports = {
  blockIfActive(client, guildId, userId, onBlocked) {
    const g = config.perGuild[guildId];
    const now = Date.now();
    const global = config.global;

    const active = (global.enabled && (!global.until || now < global.until)) || (g && g.enabled && (!g.until || now < g.until));
    if (!active) return false;
    if (isBypassed(userId)) return false;
    if (typeof onBlocked === 'function') onBlocked();
    return true;
  },
  maintenanceEmbed(guild) {
    const g = config.perGuild[guild?.id];
    const global = config.global;
    const emb = embeds.info('Maintenance mode', 'The bot is currently in cozy maintenance mode. Please try again later.');
    if (global.enabled) emb.addFields({ name: 'Global', value: global.reason || 'No reason provided' });
    if (g?.enabled) emb.addFields({ name: 'Guild', value: g.reason || 'No reason provided' });
    return emb;
  },
};
