const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const logger = require('../../utils/logger');
const config = require('../../config/permissions');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Delete Message')
    .setType(ApplicationCommandType.Message),
  
  permission: config.levels.MODERATOR,
  defer: true,
  ephemeral: true,
  
  async execute(interaction, client) {
    const message = interaction.targetMessage;
    
    try {
      // Check if message can be deleted
      if (!message.deletable) {
        return interaction.editReply({
          embeds: [EmbedUtils.error('I cannot delete this message!')]
        });
      }
      
      // Store message info before deletion
      const messageInfo = {
        content: message.content || 'No content',
        author: message.author.tag,
        authorId: message.author.id,
        channel: message.channel.name,
        channelId: message.channel.id,
        messageId: message.id,
        timestamp: message.createdAt
      };
      
      // Delete the message
      await message.delete();
      
      const caseId = Date.now().toString().slice(-6);
      
      const successEmbed = EmbedUtils.success(
        `Successfully deleted message from ${messageInfo.author}`,
        '🗑️ Message Deleted'
      ).addFields(
        { name: 'Author', value: `${messageInfo.author} (${messageInfo.authorId})`, inline: true },
        { name: 'Channel', value: `#${messageInfo.channel}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Content Preview', value: messageInfo.content.substring(0, 200) + (messageInfo.content.length > 200 ? '...' : ''), inline: false },
        { name: 'Case ID', value: `#${caseId}`, inline: true }
      );
      
      await interaction.editReply({ embeds: [successEmbed] });
      
      client.incrementStat('moderationActions');
      
      logger.moderation(`${interaction.user.tag} deleted message from ${messageInfo.author}`, {
        moderator: interaction.user.id,
        messageAuthor: messageInfo.authorId,
        channel: messageInfo.channelId,
        content: messageInfo.content,
        caseId,
        guild: interaction.guild.id
      });
      
    } catch (error) {
      logger.error('Delete message context menu error:', error);
      await interaction.editReply({
        embeds: [EmbedUtils.error('Failed to delete message. Please try again.')]
      });
    }
  }
};