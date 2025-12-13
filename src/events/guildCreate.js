const logChannels = require('../utils/logChannels');

module.exports = {
  name: 'guildCreate',
  async execute(client, guild) {
    await logChannels.ensureGuildLogChannels(guild);
  }
};
