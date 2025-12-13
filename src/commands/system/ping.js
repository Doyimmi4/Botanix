const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  name: 'ping',
  type: 'slash',
  data: new SlashCommandBuilder().setName('ping').setDescription('Show latency with a cute embed'),
  async execute({ client, interaction }) {
    const sent = await interaction.reply({ ephemeral: true, content: 'Pinging…' });
    const ws = Math.round(client.ws.ping);
    const rt = sent.createdTimestamp - interaction.createdTimestamp;
    const embed = embeds.info('Pong! 🏓', `Websocket: **${ws}ms**\nRoundtrip: **${rt}ms**`);
    await interaction.editReply({ content: '', embeds: [embed] });
  }
};
