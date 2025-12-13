const logger = require('../utils/logger');
const permissionHandler = require('./permissionHandler');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    try {
      if (!interaction.inCachedGuild()) return;
      if (!interaction.isContextMenuCommand()) return;

      const cmd = client.contextCommands.get(interaction.commandName);
      if (!cmd) return;

      const allowed = permissionHandler.validate(interaction.member, cmd, interaction);
      if (!allowed) return;

      await cmd.execute({ client, interaction });
    } catch (err) {
      logger.error({ err }, 'Context handler error');
      try { if (!interaction.replied) await interaction.reply({ ephemeral: true, content: '💔 An error occurred running this command.' }); } catch {}
    }
  });
};
