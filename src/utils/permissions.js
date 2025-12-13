const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/permissions');
const owners = require('../config/owners');

class PermissionUtils {
  static getPermissionLevel(member) {
    const userId = member.user?.id || member.id;
    
    // Check if owner
    if (owners.owners.includes(userId)) {
      return config.levels.OWNER;
    }
    
    // Check if developer
    if (owners.developers.includes(userId)) {
      return config.levels.DEV;
    }
    
    // Check if guild owner
    if (member.guild && member.guild.ownerId === userId) {
      return config.levels.ADMIN;
    }
    
    // Check roles
    if (member.roles && member.roles.cache) {
      const roles = member.roles.cache;
      
      // Check for admin permissions
      if (roles.some(role => role.permissions.has(PermissionFlagsBits.Administrator))) {
        return config.levels.ADMIN;
      }
      
      // Check for moderator roles
      if (roles.some(role => owners.moderatorRoles.includes(role.name))) {
        return config.levels.MODERATOR;
      }
      
      // Check for support roles
      if (roles.some(role => owners.supportRoles.includes(role.name))) {
        return config.levels.SUPPORT;
      }
    }
    
    return config.levels.USER;
  }

  static hasPermission(member, requiredLevel) {
    const userLevel = this.getPermissionLevel(member);
    return userLevel >= requiredLevel;
  }

  static canModerate(moderator, target) {
    // Cannot moderate yourself
    if (moderator.id === target.id) return false;
    
    // Cannot moderate bots (except owners)
    if (target.bot && this.getPermissionLevel(moderator) < config.levels.OWNER) return false;
    
    // Cannot moderate higher or equal permission level
    const modLevel = this.getPermissionLevel(moderator);
    const targetLevel = this.getPermissionLevel(target);
    
    return modLevel > targetLevel;
  }

  static canManageRole(member, role, bot) {
    // Check if member can manage roles
    if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) return false;
    
    // Check role hierarchy
    if (member.roles.highest.position <= role.position) return false;
    
    // Check bot's role hierarchy
    if (bot.roles.highest.position <= role.position) return false;
    
    // Check if role is protected
    if (owners.moderatorRoles.includes(role.name) || owners.supportRoles.includes(role.name)) {
      return this.getPermissionLevel(member) >= config.levels.ADMIN;
    }
    
    return true;
  }

  static validateBotPermissions(channel, permissions) {
    const botMember = channel.guild.members.me;
    const missing = [];
    
    for (const permission of permissions) {
      if (!botMember.permissionsIn(channel).has(permission)) {
        missing.push(permission);
      }
    }
    
    return missing;
  }

  static formatPermissions(permissions) {
    return permissions.map(perm => {
      return perm.toString()
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }).join(', ');
  }

  static isBlacklisted(userId, guildId = null) {
    if (owners.blacklistedUsers.includes(userId)) return true;
    if (guildId && owners.blacklistedGuilds.includes(guildId)) return true;
    return false;
  }

  static isDangerous(permissions) {
    return permissions.some(perm => config.dangerous.includes(perm));
  }

  static getRequiredPermissions(commandName) {
    return config.moderation[commandName] || [];
  }
}

module.exports = PermissionUtils;