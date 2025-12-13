const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const PermissionUtils = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display user information 👤')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get information about')),
  
  cooldown: 5000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    
    try {
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      
      const createdDate = Math.floor(target.createdTimestamp / 1000);
      const joinedDate = member ? Math.floor(member.joinedTimestamp / 1000) : null;
      
      // Get permission level
      const permLevel = member ? PermissionUtils.getPermissionLevel(member) : 0;
      const permLevels = ['User', 'Support', 'Moderator', 'Admin', 'Developer', 'Owner'];
      
      // User flags
      const flags = target.flags?.toArray() || [];
      const flagEmojis = {
        'Staff': '👨‍💼',
        'Partner': '🤝',
        'Hypesquad': '🎉',
        'BugHunterLevel1': '🐛',
        'BugHunterLevel2': '🐛',
        'HypeSquadOnlineHouse1': '🏠',
        'HypeSquadOnlineHouse2': '🏠',
        'HypeSquadOnlineHouse3': '🏠',
        'PremiumEarlySupporter': '💎',
        'VerifiedDeveloper': '⚙️',
        'CertifiedModerator': '🛡️',
        'BotHTTPInteractions': '🤖'
      };
      
      const embed = EmbedUtils.info('', `👤 ${target.tag}`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '🆔 User ID', value: target.id, inline: true },
          { name: '📅 Account Created', value: `<t:${createdDate}:F>`, inline: true },
          { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true }
        );
      
      if (member) {
        embed.addFields(
          { name: '📥 Joined Server', value: `<t:${joinedDate}:F>`, inline: true },
          { name: '🎭 Roles', value: `${member.roles.cache.size - 1}`, inline: true },
          { name: '🔑 Bot Permission Level', value: `${permLevel} (${permLevels[permLevel]})`, inline: true }
        );
        
        // Show highest role
        if (member.roles.highest.id !== interaction.guild.id) {
          embed.addFields({ name: '👑 Highest Role', value: member.roles.highest.toString(), inline: true });
        }
        
        // Show nickname
        if (member.nickname) {
          embed.addFields({ name: '📝 Nickname', value: member.nickname, inline: true });
        }
      } else {
        embed.addFields({ name: '📥 Server Member', value: 'No', inline: true });
      }
      
      // Show badges
      if (flags.length > 0) {
        const badgeText = flags.map(flag => `${flagEmojis[flag] || '🏷️'} ${flag}`).join('\n');
        embed.addFields({ name: '🏆 Badges', value: badgeText, inline: false });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to fetch user information. Please try again.')]
      });
    }
  }
};