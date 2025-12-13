const automod = require('../utils/automod');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
    try {
      await automod.processMessage(client, message);
    } catch (err) {
      // errors already internally logged
    }
  });

  client.on('guildMemberAdd', async (member) => {
    try {
      await automod.processJoin(client, member);
    } catch (err) {}
  });
};
