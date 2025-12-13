const { PermissionsBitField } = require('discord.js');
const hierarchy = require('../utils/hierarchy');
const logger = require('../utils/logger');

module.exports = {
  validate(member, cmd, context) {
    try {
      // Owner/dev/support layers
      if (cmd.ownerOnly && !this.isOwner(member.id)) return false;
      if (cmd.devOnly && !this.isDeveloper(member.id)) return false;
      if (cmd.supportOnly && !this.isSupport(member.id, member.guild)) return false;

      // Discord permission checks
      const required = (cmd.permissions || []).map(p => PermissionsBitField.Flags[p]).filter(Boolean);
      if (required.length && !member.permissions.has(required)) {
        const reply = { ephemeral: true, content: '⚠️ You lack permissions for this command.' };
        if (context?.reply) context.reply(reply).catch(() => {});
        else context?.channel?.send(reply.content).catch(() => {});
        return false;
      }

      // Bot permission checks
      const me = member.guild.members.me;
      const botRequired = (cmd.botPermissions || []).map(p => PermissionsBitField.Flags[p]).filter(Boolean);
      if (botRequired.length && !me.permissions.has(botRequired)) {
        const reply = { ephemeral: true, content: '⚠️ I lack permissions to run that.' };
        if (context?.reply) context.reply(reply).catch(() => {});
        else context?.channel?.send(reply.content).catch(() => {});
        return false;
      }

      // Role hierarchy validation if target present
      if (cmd.requireTarget && context) {
        const target = context.targetMember || context.mentions?.members?.first?.() || context.member;
        if (target && !hierarchy.canModerate(member, target)) {
          const reply = { ephemeral: true, content: '⚠️ You cannot moderate that user due to role hierarchy.' };
          if (context?.reply) context.reply(reply).catch(() => {});
          else context?.channel?.send(reply.content).catch(() => {});
          return false;
        }
      }

      return true;
    } catch (err) {
      logger.error({ err }, 'Permission check failed');
      return false;
    }
  },
  isOwner(userId) {
    const { owners } = require('../config/owners');
    return owners.includes(userId);
  },
  isDeveloper(userId) {
    const { developers } = require('../config/owners');
    return developers.includes(userId) || this.isOwner(userId);
  },
  isSupport(userId, guild) {
    const { support } = require('../config/owners');
    if (support.includes(userId)) return true;
    const rolesCfg = require('../config/roles');
    return guild?.members?.cache?.get(userId)?.roles?.cache?.some(r => rolesCfg.defaults.supportRoles.includes(r.name));
  }
};
