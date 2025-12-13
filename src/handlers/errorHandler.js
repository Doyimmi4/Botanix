const logger = require('../utils/logger');

module.exports = function registerErrorHandler(client) {
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'UnhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'UncaughtException');
  });
  client.on('error', (err) => logger.error({ err }, 'Client error'));
  client.rest.on('rateLimited', (info) => logger.warn({ info }, 'Rate limited'));
};
