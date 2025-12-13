require('dotenv').config();
const { ShardingManager } = require('discord.js');
const path = require('path');
const logger = require('./utils/logger');
const { BOT_NAME } = require('./config/bot');

const token = process.env.BOT_TOKEN;
if (!token) {
  logger.fatal('❌ BOT_TOKEN is missing in environment. Exiting.');
  process.exit(1);
}

const manager = new ShardingManager(path.join(__dirname, 'client.js'), {
  token,
  respawn: true,
  totalShards: 'auto',
  mode: 'process'
});

manager.on('shardCreate', shard => {
  logger.info({ shard: shard.id }, `🌸 ${BOT_NAME} shard ${shard.id} launched`);
});

manager.spawn().catch((err) => {
  logger.fatal({ err }, 'Failed to spawn shards');
  process.exit(1);
});
