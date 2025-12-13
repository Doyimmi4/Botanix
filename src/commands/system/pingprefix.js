module.exports = {
  name: 'ping',
  type: 'prefix',
  async execute({ message, client }) {
    const sent = await message.reply('Pinging…');
    const rt = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit(`Pong! ${rt}ms | WS ${Math.round(client.ws.ping)}ms`);
  }
};
