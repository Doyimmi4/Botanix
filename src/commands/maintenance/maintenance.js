const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const maintenanceConfig = require('../../config/maintenance');
const logChannels = require('../../utils/logChannels');
const ms = require('ms');

module.exports = {
  name: 'maintenance',
  type: 'slash',
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Toggle cozy maintenance mode')
    .addSubcommand(s => s.setName('on').setDescription('Enable maintenance')
      .addStringOption(o => o.setName('scope').setDescription('global or guild').addChoices({ name: 'global', value: 'global' }, { name: 'guild', value: 'guild' }))
      .addStringOption(o => o.setName('reason').setDescription('Reason'))
      .addStringOption(o => o.setName('duration').setDescription('Duration, e.g., 30m, 2h'))) 
    .addSubcommand(s => s.setName('off').setDescription('Disable maintenance')
      .addStringOption(o => o.setName('scope').setDescription('global or guild').addChoices({ name: 'global', value: 'global' }, { name: 'guild', value: 'guild' })))
    .addSubcommand(s => s.setName('status').setDescription('Show maintenance status')),
  async execute({ interaction }) {
    const sub = interaction.options.getSubcommand();
    const scope = interaction.options.getString('scope') || 'guild';

    if (sub === 'status') {
      const g = maintenanceConfig.perGuild[interaction.guildId];
      const global = maintenanceConfig.global;
      const emb = embeds.info('Maintenance status', `Global: **${global.enabled ? 'on' : 'off'}**\nGuild: **${g?.enabled ? 'on' : 'off'}**`);
      return interaction.reply({ ephemeral: true, embeds: [emb] });
    }

    if (sub === 'on') {
      const reason = interaction.options.getString('reason') || 'Maintenance mode enabled';
      const durStr = interaction.options.getString('duration');
      const until = durStr ? (Date.now() + (ms(durStr) || 0)) : null;

      if (scope === 'global') {
        maintenanceConfig.global.enabled = true;
        maintenanceConfig.global.reason = reason;
        maintenanceConfig.global.until = until;
      } else {
        maintenanceConfig.perGuild[interaction.guildId] = { enabled: true, reason, until };
      }

      const embed = embeds.info('Maintenance enabled', `Scope: **${scope}**\nReason: ${reason}${until ? `\nUntil: <t:${Math.floor(until/1000)}:R>` : ''}`);
      const logCh = await logChannels.fetch(interaction.guild, 'maintenance-logs');
      logCh?.send({ embeds: [embed] }).catch(() => {});
      return interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    if (sub === 'off') {
      if (scope === 'global') {
        maintenanceConfig.global.enabled = false; maintenanceConfig.global.reason = null; maintenanceConfig.global.until = null;
      } else {
        maintenanceConfig.perGuild[interaction.guildId] = { enabled: false, reason: null, until: null };
      }
      const embed = embeds.success('Maintenance disabled', `Scope: **${scope}**`);
      const logCh = await logChannels.fetch(interaction.guild, 'maintenance-logs');
      logCh?.send({ embeds: [embed] }).catch(() => {});
      return interaction.reply({ ephemeral: true, embeds: [embed] });
    }
  }
};
