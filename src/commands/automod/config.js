const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const automod = require('../../utils/automod');

module.exports = {
  name: 'automod',
  type: 'slash',
  permissions: ['ManageGuild'],
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Configure AutoMod')
    .addSubcommand(s => s.setName('enable').setDescription('Enable AutoMod'))
    .addSubcommand(s => s.setName('disable').setDescription('Disable AutoMod'))
    .addSubcommand(s => s.setName('status').setDescription('Show AutoMod status')),
  async execute({ interaction }) {
    const sub = interaction.options.getSubcommand();
    const cfg = automod.getConfig(interaction.guild.id);

    if (sub === 'enable') cfg.enabled = true;
    else if (sub === 'disable') cfg.enabled = false;

    const embed = embeds.info('AutoMod', `Enabled: **${cfg.enabled ? 'Yes' : 'No'}**`);
    await interaction.reply({ ephemeral: true, embeds: [embed] });
  }
};
