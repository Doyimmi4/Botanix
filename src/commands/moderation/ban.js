const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logChannels = require('../../utils/logChannels');
const cooldowns = require('../../utils/cooldowns');

module.exports = {
  name: 'ban',
  type: 'slash',
  permissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user with reason and duration')
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason'))
    .addBooleanOption(o => o.setName('silent').setDescription('Do not announce'))
    .addBooleanOption(o => o.setName('dm').setDescription('Send DM to user'))
    .addStringOption(o => o.setName('duration').setDescription('Duration like 1d, 2h (omit for permanent)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute({ client, interaction }) {
    const cd = cooldowns.check(`ban:${interaction.user.id}`);
    if (cd) return interaction.reply({ ephemeral: true, content: `��� Slow down please. Try again in ${Math.ceil(cd/1000)}s.` });

    const target = interaction.options.getUser('user', true);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const silent = interaction.options.getBoolean('silent') || false;
    const dm = interaction.options.getBoolean('dm') ?? true;
    const durationStr = interaction.options.getString('duration');

    if (!member) return interaction.reply({ ephemeral: true, content: 'User is not in the server.' });

    // Duration parsing
    let deleteMessageSeconds = 0; // could be option
    let durationMs = null;
    if (durationStr) {
      try { durationMs = require('ms')(durationStr); } catch {}
    }

    if (dm) {
      member.send({ embeds: [embeds.info('You were banned', `Server: **${interaction.guild.name}**\nReason: ${reason}`)] }).catch(() => {});
    }

    await interaction.deferReply({ ephemeral: true });

    await member.ban({ deleteMessageSeconds, reason }).catch(err => interaction.editReply({ content: 'Failed to ban user: ' + (err?.message || 'Unknown') }));

    if (durationMs) {
      setTimeout(async () => {
        await interaction.guild.members.unban(member.id, 'Tempban expired').catch(() => {});
      }, Math.min(durationMs, 24 * 3600 * 1000)); // safety cap to 24h timer process
    }

    const embed = embeds.success('User banned', `Target: <@${member.id}>\nReason: ${reason}`);
    const logCh = await logChannels.fetch(interaction.guild, 'ban-logs');
    logCh?.send({ embeds: [embed] }).catch(() => {});

    await interaction.editReply({ embeds: [embed], content: silent ? undefined : 'User has been banned.' });
  }
};
