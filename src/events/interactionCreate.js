const logger = require('../utils/logger');
const PermissionUtils = require('../utils/permissions');
const EmbedUtils = require('../utils/embeds');
const cooldowns = require('../utils/cooldowns');
const constants = require('../utils/constants');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Check if bot is in maintenance mode
      if (client.maintenanceMode && PermissionUtils.getPermissionLevel(interaction.member) < 4) {
        return interaction.reply({
          embeds: [EmbedUtils.maintenance(client.maintenanceMessage)],
          ephemeral: true
        });
      }

      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction, client);
      }
      
      // Handle context menu commands
      else if (interaction.isContextMenuCommand()) {
        await handleContextMenu(interaction, client);
      }
      
      // Handle autocomplete
      else if (interaction.isAutocomplete()) {
        await handleAutocomplete(interaction, client);
      }
    } catch (error) {
      logger.error('Error in interactionCreate:', error);
      
      const errorEmbed = EmbedUtils.error('An unexpected error occurred while processing your interaction.');
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      } catch (replyError) {
        logger.error('Failed to send error response:', replyError);
      }
    }
  }
};

async function handleSlashCommand(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  // Check blacklist
  if (PermissionUtils.isBlacklisted(interaction.user.id, interaction.guild?.id)) {
    return interaction.reply({
      embeds: [EmbedUtils.error('You are blacklisted from using this bot.')],
      ephemeral: true
    });
  }

  // Check permissions
  if (command.permission && !PermissionUtils.hasPermission(interaction.member, command.permission)) {
    return interaction.reply({
      embeds: [EmbedUtils.error(constants.MESSAGES.NO_PERMISSION)],
      ephemeral: true
    });
  }

  // Check bot permissions
  if (command.botPermissions) {
    const missing = PermissionUtils.validateBotPermissions(interaction.channel, command.botPermissions);
    if (missing.length > 0) {
      return interaction.reply({
        embeds: [EmbedUtils.error(`I'm missing the following permissions: ${PermissionUtils.formatPermissions(missing)}`)],
        ephemeral: true
      });
    }
  }

  // Check cooldown
  if (command.cooldown && PermissionUtils.getPermissionLevel(interaction.member) < 4) {
    if (cooldowns.hasCooldown(interaction.user.id, command.name)) {
      const remaining = cooldowns.getRemainingTime(interaction.user.id, command.name);
      return interaction.reply({
        embeds: [EmbedUtils.warning(constants.MESSAGES.COOLDOWN.replace('{time}', remaining))],
        ephemeral: true
      });
    }
    cooldowns.setCooldown(interaction.user.id, command.name, command.cooldown);
  }

  // Auto-defer if command takes time
  if (command.defer && !interaction.replied && !interaction.deferred) {
    await interaction.deferReply({ ephemeral: command.ephemeral || false });
  } else if (!command.defer && !interaction.replied && !interaction.deferred) {
    // Ensure we respond within 3 seconds
    setTimeout(() => {
      if (!interaction.replied && !interaction.deferred) {
        interaction.reply({ content: 'Processing...', ephemeral: true }).catch(() => {});
      }
    }, 2500);
  }

  // Execute command
  try {
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`Command ${command.data.name} error:`, error);
    
    const errorEmbed = EmbedUtils.error('Command execution failed. Please try again.');
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    }
    return;
  }
  
  // Update stats
  client.incrementStat('commandsExecuted');
  
  // Log command usage
  logger.command(`${interaction.user.tag} used /${command.name}`, {
    guild: interaction.guild?.name,
    channel: interaction.channel?.name,
    userId: interaction.user.id,
    guildId: interaction.guild?.id
  });
}

async function handleContextMenu(interaction, client) {
  const command = client.contextMenus.get(interaction.commandName);
  if (!command) return;

  // Similar checks as slash commands
  if (PermissionUtils.isBlacklisted(interaction.user.id, interaction.guild?.id)) {
    return interaction.reply({
      embeds: [EmbedUtils.error('You are blacklisted from using this bot.')],
      ephemeral: true
    });
  }

  if (command.permission && !PermissionUtils.hasPermission(interaction.member, command.permission)) {
    return interaction.reply({
      embeds: [EmbedUtils.error(constants.MESSAGES.NO_PERMISSION)],
      ephemeral: true
    });
  }

  if (command.defer && !interaction.replied && !interaction.deferred) {
    await interaction.deferReply({ ephemeral: command.ephemeral || true });
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`Context menu ${command.data.name} error:`, error);
    
    const errorEmbed = EmbedUtils.error('Context menu execution failed. Please try again.');
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    }
    return;
  }
  
  client.incrementStat('commandsExecuted');
  
  logger.command(`${interaction.user.tag} used context menu: ${command.name}`, {
    guild: interaction.guild?.name,
    userId: interaction.user.id,
    guildId: interaction.guild?.id
  });
}

async function handleAutocomplete(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command || !command.autocomplete) return;

  try {
    await command.autocomplete(interaction, client);
  } catch (error) {
    logger.error('Autocomplete error:', error);
  }
}