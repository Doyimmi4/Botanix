const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  // Permission levels
  levels: {
    OWNER: 5,
    DEV: 4,
    ADMIN: 3,
    MODERATOR: 2,
    SUPPORT: 1,
    USER: 0
  },

  // Required permissions for moderation commands
  moderation: {
    ban: [PermissionFlagsBits.BanMembers],
    kick: [PermissionFlagsBits.KickMembers],
    timeout: [PermissionFlagsBits.ModerateMembers],
    mute: [PermissionFlagsBits.ManageRoles],
    purge: [PermissionFlagsBits.ManageMessages],
    slowmode: [PermissionFlagsBits.ManageChannels],
    lock: [PermissionFlagsBits.ManageChannels],
    nick: [PermissionFlagsBits.ManageNicknames],
    role: [PermissionFlagsBits.ManageRoles]
  },

  // Bot required permissions
  botRequired: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageNicknames
  ],

  // Dangerous permissions that require extra validation
  dangerous: [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers
  ]
};