const { PRESENCE, BOT_NAME } = require('../config/bot');
const logger = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      await client.user.setPresence(PRESENCE);
      logger.info({ shard: client.shard?.ids?.[0] ?? 0 }, `✨ ${BOT_NAME} is online as ${client.user.tag}`);
    } catch (err) {
      logger.error({ err }, 'Error in ready event');
    }
  }
};
