const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logChannels = require('../../utils/logChannels');
const cooldowns = require('../../utils/cooldowns');
const ms = require('ms');

module.exports = {
  name: 'timeout',
  type: 'slash',
  permissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user for a duration')
    .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration e.g., 10m, 2h').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .addBooleanOption(o => o.setName('silent').setDescription('Do not announce'))
    .addBooleanOption(o => o.setName('dm').setDescription('Send DM to user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute({ interaction }) {
    const cd = cooldowns.check(`timeout:${interaction.user.id}`);
    if (cd) return interaction.reply({ ephemeral: true, content: `⏳ Try again in ${Math.ceil(cd/1000)}s.` });

    const target = interaction.options.getUser('user', true);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const silent = interaction.options.getBoolean('silent') || false;
    const dm = interaction.options.getBoolean('dm') ?? true;
    const durationStr = interaction.options.getString('duration', true);
    const duration = ms(durationStr);
    if (!duration || duration < 10_000 || duration > 28 * 24 * 3600 * 1000) {
      return interaction.reply({ ephemeral: true, content: 'Duration must be between 10s and 28d.' });
    }
    if (!member) return interaction.reply({ ephemeral: true, content: 'User not found in this guild.' });

    await interaction.deferReply({ ephemeral: true });

    if (dm) member.send({ embeds: [embeds.info('You were timed out', `Server: **${interaction.guild.name}**\nDuration: **${durationStr}**\nReason: ${reason}`)] }).catch(() => {});

    await member.timeout(duration, reason).catch(err => interaction.editReply({ content: 'Failed to timeout: ' + (err?.message || 'Unknown') }));

    const embed = embeds.success('User timed out', `Target: <@${member.id}>\nDuration: **${durationStr}**\nReason: ${reason}`);
    const logCh = await logChannels.fetch(interaction.guild, 'timeout-logs');
    logCh?.send({ embeds: [embed] }).catch(() => {});

    await interaction.editReply({ embeds: [embed], content: silent ? undefined : 'Timeout applied.' });
  }
};
