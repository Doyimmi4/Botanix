require('dotenv').config();
const BotanixClient = require('./client');
const logger = require('./utils/logger');
const PresenceManager = require('./utils/presence');

// Environment validation
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  logger.error('Please set these variables in your hosting platform environment settings.');
  process.exit(1);
}

// ShardCloud compatibility
if (process.env.NODE_ENV === 'production') {
  logger.info('Running in production mode for ShardCloud');
}

// Create client instance
const client = new BotanixClient();

// Initialize presence manager
client.presenceManager = new PresenceManager(client);

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown for ShardCloud
const shutdown = (signal) => {
  logger.system(`Received ${signal}, shutting down gracefully...`);
  if (client.presenceManager) {
    client.presenceManager.stop();
  }
  client.destroy();
  setTimeout(() => process.exit(0), 5000); // Force exit after 5s
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGHUP', () => shutdown('SIGHUP'));

// Start the bot
logger.startup();
client.start().catch(error => {
  logger.error('Failed to start client:', error);
  process.exit(1);
});