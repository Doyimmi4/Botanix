const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Display server information 🏰'),
  
  cooldown: 10000,
  defer: true,
  
  async execute(interaction, client) {
    const guild = interaction.guild;
    
    try {
      const owner = await guild.fetchOwner();
      const createdDate = Math.floor(guild.createdTimestamp / 1000);
      
      // Get channel counts
      const channels = guild.channels.cache;
      const textChannels = channels.filter(c => c.type === 0).size;
      const voiceChannels = channels.filter(c => c.type === 2).size;
      const categories = channels.filter(c => c.type === 4).size;
      
      // Get member counts
      const members = guild.members.cache;
      const humans = members.filter(m => !m.user.bot).size;
      const bots = members.filter(m => m.user.bot).size;
      
      // Verification levels
      const verificationLevels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High'
      };
      
      const embed = EmbedUtils.info('', `🏰 ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '👑 Owner', value: owner.user.tag, inline: true },
          { name: '🆔 Server ID', value: guild.id, inline: true },
          { name: '📅 Created', value: `<t:${createdDate}:F>`, inline: true },
          { name: '👥 Members', value: `${guild.memberCount} total\n${humans} humans\n${bots} bots`, inline: true },
          { name: '📺 Channels', value: `${channels.size} total\n${textChannels} text\n${voiceChannels} voice\n${categories} categories`, inline: true },
          { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
          { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
          { name: '🔒 Verification', value: verificationLevels[guild.verificationLevel], inline: true },
          { name: '🚀 Boost Level', value: `Level ${guild.premiumTier}\n${guild.premiumSubscriptionCount || 0} boosts`, inline: true }
        );
      
      if (guild.description) {
        embed.addFields({ name: '📝 Description', value: guild.description, inline: false });
      }
      
      if (guild.banner) {
        embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to fetch server information. Please try again.')]
      });
    }
  }
};