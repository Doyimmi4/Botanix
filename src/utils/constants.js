module.exports = {
  // Time constants
  TIME: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000
  },

  // Limits
  LIMITS: {
    EMBED_TITLE: 256,
    EMBED_DESCRIPTION: 4096,
    EMBED_FIELD_NAME: 256,
    EMBED_FIELD_VALUE: 1024,
    EMBED_FOOTER: 2048,
    EMBED_AUTHOR: 256,
    EMBED_FIELDS: 25,
    MESSAGE_CONTENT: 2000,
    REASON_LENGTH: 512,
    NICKNAME_LENGTH: 32,
    PURGE_LIMIT: 100
  },

  // Regex patterns
  REGEX: {
    USER_ID: /^<@!?(\d{17,19})>$/,
    CHANNEL_ID: /^<#(\d{17,19})>$/,
    ROLE_ID: /^<@&(\d{17,19})>$/,
    EMOJI: /<a?:\w+:(\d{17,19})>/,
    URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    INVITE: /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[^\s]+/,
    TIME: /^(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hour|hours|d|day|days|w|week|weeks)$/i
  },

  // Default messages
  MESSAGES: {
    NO_PERMISSION: 'You don\'t have permission to use this command! 🌸',
    BOT_NO_PERMISSION: 'I don\'t have the required permissions to execute this command! 🌸',
    COOLDOWN: 'Please wait {time} before using this command again! 🌸',
    ERROR: 'An error occurred while executing this command! 🌸',
    MAINTENANCE: 'Botanix is currently under maintenance! Please try again later 🌸',
    INVALID_USER: 'Please provide a valid user! 🌸',
    INVALID_CHANNEL: 'Please provide a valid channel! 🌸',
    INVALID_ROLE: 'Please provide a valid role! 🌸',
    INVALID_TIME: 'Please provide a valid time duration! 🌸',
    HIERARCHY_ERROR: 'I cannot perform this action due to role hierarchy! 🌸',
    SELF_ACTION: 'You cannot perform this action on yourself! 🌸',
    BOT_ACTION: 'You cannot perform this action on bots! 🌸'
  },

  // Status messages
  STATUS: {
    ONLINE: 'Watching over the garden 🌸',
    IDLE: 'Taking a nap in the garden 🌙',
    DND: 'Busy tending to the flowers 🌺',
    MAINTENANCE: 'Under maintenance 🔧'
  },

  // Log categories
  LOG_CATEGORIES: {
    SYSTEM: 'system',
    COMMAND: 'command',
    MODERATION: 'moderation',
    DEV: 'dev',
    SHARD: 'shard',
    ERROR: 'error',
    CACHE: 'cache'
  },

  // Cache keys
  CACHE_KEYS: {
    GUILD_SETTINGS: 'guild_settings',
    USER_WARNINGS: 'user_warnings',
    COOLDOWNS: 'cooldowns',
    AUTOMOD_VIOLATIONS: 'automod_violations',
    MAINTENANCE_MODE: 'maintenance_mode'
  }
};