module.exports = {
  // in-memory defaults; persisted state could be added with DB in production
  global: {
    enabled: false,
    reason: null,
    until: null,
  },
  perGuild: {
    // guildId: { enabled, reason, until }
  }
};
