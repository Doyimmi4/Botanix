const { Collection } = require('discord.js');
const logger = require('../utils/logger');
const permissionHandler = require('./permissionHandler');
const maintenanceUtil = require('../utils/maintenance');
const { PREFIX } = require('../config/bot');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    try {
      if (!message.guild || message.author.bot) return;
      if (!message.content.startsWith(client.prefix || PREFIX)) return;

      const isMaintBlocked = maintenanceUtil.blockIfActive(client, message.guildId, message.author.id, () => message.reply({ embeds: [maintenanceUtil.maintenanceEmbed(message.guild)] }));
      if (isMaintBlocked) return;

      const args = message.content.slice((client.prefix || PREFIX).length).trim().split(/\s+/);
      const name = args.shift().toLowerCase();

      const cmd = client.commands.get(name);
      if (!cmd) return;

      const allowed = permissionHandler.validate(message.member, cmd, message);
      if (!allowed) return;

      await cmd.execute({ client, message, args });
    } catch (err) {
      logger.error({ err }, 'Prefix handler error');
      try { await message.reply('💔 An error occurred running this command.'); } catch {}
    }
  });
};
