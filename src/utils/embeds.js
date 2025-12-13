const { EmbedBuilder } = require('discord.js');
const { COLORS } = require('../config/bot');

module.exports = {
  base(title, description) {
    return new EmbedBuilder().setColor(COLORS.primary).setTitle(title || '🌸 Botanix').setDescription(description || '')
      .setTimestamp();
  },
  success(title, description) {
    return new EmbedBuilder().setColor(COLORS.success).setTitle(`🌿 ${title || 'Success'}`).setDescription(description || '').setTimestamp();
  },
  error(title, description) {
    return new EmbedBuilder().setColor(COLORS.error).setTitle(`💔 ${title || 'Error'}`).setDescription(description || '').setTimestamp();
  },
  info(title, description) {
    return new EmbedBuilder().setColor(COLORS.info).setTitle(`🌸 ${title || 'Info'}`).setDescription(description || '').setTimestamp();
  }
};
