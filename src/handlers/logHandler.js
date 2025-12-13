const logChannels = require('../utils/logChannels');

module.exports = {
  bootstrap(client) {
    client.on('guildCreate', async (guild) => {
      await logChannels.ensureGuildLogChannels(guild);
    });

    client.on('channelDelete', async (channel) => {
      if (!channel.guild) return;
      await logChannels.ensureGuildLogChannels(channel.guild); // auto-heal
    });
  }
};
