const { GatewayIntentBits, Partials, ActivityType } = require('discord.js');

module.exports = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ],
  presence: {
    activities: [{
      name: 'over the garden 🌸',
      type: ActivityType.Watching
    }],
    status: 'online'
  },
  defaultPrefix: 'b!',
  maxWarnings: 5,
  warnPointThresholds: {
    3: 'timeout',
    5: 'kick',
    7: 'ban'
  },
  automod: {
    enabled: true,
    spamThreshold: 5,
    spamInterval: 5000,
    mentionLimit: 5,
    emojiLimit: 10,
    linkWhitelist: ['discord.gg', 'youtube.com', 'github.com'],
    raidJoinVelocity: 10,
    minAccountAge: 86400000 // 1 day
  },
  colors: {
    primary: 0xFFB6C1,    // Light Pink
    success: 0x98FB98,    // Pale Green
    warning: 0xFFE4B5,    // Moccasin
    error: 0xFFB6C1,      // Light Pink (soft error)
    info: 0xE6E6FA,       // Lavender
    moderation: 0xDDA0DD  // Plum
  }
};