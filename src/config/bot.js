module.exports = {
  BOT_NAME: 'Botanix',
  PREFIX: 'b!',
  PRESENCE: {
    status: 'online',
    activities: [{ name: 'with cozy moderation 🌸', type: 0 }]
  },
  COLORS: {
    primary: 0xFFC0CB,
    success: 0xB0EACD,
    error: 0xFF6B6B,
    warning: 0xFFD166,
    info: 0xA0C4FF,
  },
  LOG_CATEGORY_NAME: '🌸 Botanix Logs',
  LOG_CHANNELS: [
    'ban-logs','kick-logs','warn-logs','mute-logs','timeout-logs','role-logs','nickname-logs','purge-logs','automod-logs','maintenance-logs','error-logs'
  ],
  COOLDOWN_DEFAULT_MS: 3000,
};
