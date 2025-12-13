module.exports = {
  owners: (process.env.BOT_OWNERS || '').split(',').filter(Boolean),
  developers: (process.env.BOT_DEVS || '').split(',').filter(Boolean),
  support: (process.env.BOT_SUPPORT || '').split(',').filter(Boolean),
};
