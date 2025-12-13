const logger = require('../utils/logger');
const EmbedUtils = require('../utils/embeds');

class ErrorHandler {
  constructor(client) {
    this.client = client;
  }

  async load() {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason, promise });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
    });

    // Handle Discord.js errors
    this.client.on('error', (error) => {
      logger.error('Discord.js Error:', error);
    });

    this.client.on('warn', (warning) => {
      logger.warn('Discord.js Warning:', warning);
    });

    // Handle shard errors
    this.client.on('shardError', (error, shardId) => {
      logger.error(`Shard ${shardId} Error:`, error);
    });

    logger.system('Error handler loaded');
  }

  static async handleCommandError(interaction, error) {
    logger.error('Command Error:', {
      command: interaction.commandName,
      user: interaction.user.tag,
      guild: interaction.guild?.name,
      error: error.message,
      stack: error.stack
    });

    const errorEmbed = EmbedUtils.error(
      'An unexpected error occurred while executing this command. The error has been logged.'
    );

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (replyError) {
      logger.error('Failed to send error message:', replyError);
    }
  }

  static async handleInteractionError(interaction, error) {
    logger.error('Interaction Error:', {
      type: interaction.type,
      user: interaction.user.tag,
      guild: interaction.guild?.name,
      error: error.message
    });

    const errorEmbed = EmbedUtils.error(
      'An error occurred while processing your interaction.'
    );

    try {
      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      }
    } catch (replyError) {
      logger.error('Failed to send interaction error message:', replyError);
    }
  }
}

module.exports = ErrorHandler;