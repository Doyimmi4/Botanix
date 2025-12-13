const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debug bot information 🔍')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('What to debug')
        .setRequired(true)
        .addChoices(
          { name: 'Bot Stats', value: 'stats' },
          { name: 'Guild Info', value: 'guild' },
          { name: 'User Info', value: 'user' },
          { name: 'Permissions', value: 'perms' }
        )),
  
  permission: config.levels.DEV,
  cooldown: 0,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const type = interaction.options.getString('type');
    
    try {
      let embed;
      
      switch (type) {
        case 'stats':
          const stats = client.getStats();
          embed = EmbedUtils.info('', '📊 Bot Statistics')
            .addFields(
              { name: 'Guilds', value: `${stats.guilds}`, inline: true },
              { name: 'Users', value: `${stats.users}`, inline: true },
              { name: 'Channels', value: `${stats.channels}`, inline: true },
              { name: 'Commands Executed', value: `${stats.commandsExecuted}`, inline: true },
              { name: 'Moderation Actions', value: `${stats.moderationActions}`, inline: true },
              { name: 'Uptime', value: EmbedUtils.formatUptime(stats.uptime), inline: true },
              { name: 'Memory Usage', value: `${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)}MB`, inline: true },
              { name: 'Ping', value: `${stats.ping}ms`, inline: true },
              { name: 'Shard', value: client.shard ? `${client.shard.ids.join(', ')}` : 'None', inline: true }
            );
          break;
          
        case 'guild':
          embed = EmbedUtils.info('', '🏰 Guild Information')
            .addFields(
              { name: 'Name', value: interaction.guild.name, inline: true },
              { name: 'ID', value: interaction.guild.id, inline: true },
              { name: 'Owner', value: `<@${interaction.guild.ownerId}>`, inline: true },
              { name: 'Members', value: `${interaction.guild.memberCount}`, inline: true },
              { name: 'Channels', value: `${interaction.guild.channels.cache.size}`, inline: true },
              { name: 'Roles', value: `${interaction.guild.roles.cache.size}`, inline: true },
              { name: 'Created', value: interaction.guild.createdAt.toDateString(), inline: true },
              { name: 'Verification Level', value: interaction.guild.verificationLevel.toString(), inline: true },
              { name: 'Boost Level', value: `${interaction.guild.premiumTier}`, inline: true }
            );
          break;
          
        case 'user':
          const PermissionUtils = require('../../utils/permissions');
          const userLevel = PermissionUtils.getPermissionLevel(interaction.member);
          embed = EmbedUtils.info('', '👤 User Information')
            .addFields(
              { name: 'Username', value: interaction.user.tag, inline: true },
              { name: 'ID', value: interaction.user.id, inline: true },
              { name: 'Bot Permission Level', value: `${userLevel}`, inline: true },
              { name: 'Account Created', value: interaction.user.createdAt.toDateString(), inline: true },
              { name: 'Joined Server', value: interaction.member.joinedAt?.toDateString() || 'Unknown', inline: true },
              { name: 'Roles', value: `${interaction.member.roles.cache.size}`, inline: true }
            );
          break;
          
        case 'perms':
          const botPerms = interaction.guild.members.me.permissions.toArray();
          embed = EmbedUtils.info('', '🔐 Bot Permissions')
            .addFields(
              { name: 'Administrator', value: botPerms.includes('Administrator') ? '✅' : '❌', inline: true },
              { name: 'Manage Server', value: botPerms.includes('ManageGuild') ? '✅' : '❌', inline: true },
              { name: 'Manage Roles', value: botPerms.includes('ManageRoles') ? '✅' : '❌', inline: true },
              { name: 'Ban Members', value: botPerms.includes('BanMembers') ? '✅' : '❌', inline: true },
              { name: 'Kick Members', value: botPerms.includes('KickMembers') ? '✅' : '❌', inline: true },
              { name: 'Moderate Members', value: botPerms.includes('ModerateMembers') ? '✅' : '❌', inline: true },
              { name: 'Manage Messages', value: botPerms.includes('ManageMessages') ? '✅' : '❌', inline: true },
              { name: 'Manage Channels', value: botPerms.includes('ManageChannels') ? '✅' : '❌', inline: true },
              { name: 'View Audit Log', value: botPerms.includes('ViewAuditLog') ? '✅' : '❌', inline: true }
            );
          break;
          
        default:
          return interaction.editReply({
            embeds: [EmbedUtils.error('Invalid debug type!')]
          });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error(`Debug failed: ${error.message}`)]
      });
    }
  }
};