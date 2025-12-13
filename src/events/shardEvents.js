const logger = require('../utils/logger');

module.exports = {
  name: 'shardError',
  async execute(client, error, shardId) {
    logger.error({ err: error, shard: shardId }, 'Shard error');
  }
};
