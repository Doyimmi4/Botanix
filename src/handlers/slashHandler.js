const { InteractionType } = require('discord.js');
const logger = require('../utils/logger');
const permissionHandler = require('./permissionHandler');
const maintenanceUtil = require('../utils/maintenance');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    try {
      if (!interaction.inCachedGuild()) return;
      if (interaction.type !== InteractionType.ApplicationCommand) return;

      const isMaintBlocked = maintenanceUtil.blockIfActive(client, interaction.guildId, interaction.user.id, () => interaction.reply({ ephemeral: true, embeds: [maintenanceUtil.maintenanceEmbed(interaction.guild)] }));
      if (isMaintBlocked) return;

      const cmd = client.slashCommands.get(interaction.commandName) || client.contextCommands.get(interaction.commandName);
      if (!cmd) return;

      const allowed = permissionHandler.validate(interaction.member, cmd, interaction);
      if (!allowed) return;

      await cmd.execute({ client, interaction });
    } catch (err) {
      logger.error({ err }, 'Slash handler error');
      try { if (!interaction.replied) await interaction.reply({ ephemeral: true, content: '💔 An error occurred running this command.' }); } catch {}
    }
  });
};
