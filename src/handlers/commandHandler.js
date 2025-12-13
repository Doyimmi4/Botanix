const fs = require('fs');
const path = require('path');
const { Collection, REST, Routes } = require('discord.js');
const logger = require('../utils/logger');
const slashHandler = require('./slashHandler');
const prefixHandler = require('./prefixHandler');
const contextHandler = require('./contextHandler');

module.exports = function registerCommandHandler(client) {
  // Load command files
  const base = path.join(__dirname, '..', 'commands');
  const groups = fs.readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory());
  const slashData = [];

  for (const group of groups) {
    const dir = path.join(base, group.name);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const cmd = require(path.join(dir, file));
      if (!cmd || !cmd.name) continue;
      if (cmd.type === 'slash') {
        client.slashCommands.set(cmd.name, cmd);
        if (cmd.data) slashData.push(cmd.data.toJSON());
      } else if (cmd.type === 'context') {
        client.contextCommands.set(cmd.name, cmd);
        if (cmd.data) slashData.push(cmd.data.toJSON());
      } else {
        client.commands.set(cmd.name, cmd);
      }
    }
  }

  // Register application commands globally (or per guild if GUILD_ID present) after ready
  client.once('ready', async () => {
    try {
      const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
      if (process.env.REGISTER_GUILD) {
        await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.REGISTER_GUILD), { body: slashData });
        logger.info({ shard: client.shard?.ids?.[0] ?? 0 }, `Registered ${slashData.length} guild application commands`);
      } else {
        await rest.put(Routes.applicationCommands(client.user.id), { body: slashData });
        logger.info({ shard: client.shard?.ids?.[0] ?? 0 }, `Registered ${slashData.length} global application commands`);
      }
    } catch (err) {
      logger.error({ err }, 'Failed to register application commands');
    }
  });

  // Wire handlers
  slashHandler(client);
  prefixHandler(client);
  contextHandler(client);
};
