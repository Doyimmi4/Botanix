const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Display user avatar 🖼️')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get avatar from')),
  
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    
    try {
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      
      const embed = EmbedUtils.info('', `🖼️ ${target.tag}'s Avatar`)
        .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: '🔗 Links', value: `[PNG](${target.displayAvatarURL({ extension: 'png', size: 1024 })}) | [JPG](${target.displayAvatarURL({ extension: 'jpg', size: 1024 })}) | [WEBP](${target.displayAvatarURL({ extension: 'webp', size: 1024 })})${target.avatar?.startsWith('a_') ? ` | [GIF](${target.displayAvatarURL({ extension: 'gif', size: 1024 })})` : ''}`, inline: false }
        );
      
      // Show server avatar if different
      if (member && member.avatar && member.avatar !== target.avatar) {
        embed.addFields(
          { name: '🏰 Server Avatar', value: `[View Server Avatar](${member.displayAvatarURL({ dynamic: true, size: 1024 })})`, inline: true }
        );
      }
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to fetch avatar. Please try again.')]
      });
    }
  }
};