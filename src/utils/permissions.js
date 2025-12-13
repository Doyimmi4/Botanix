const { PermissionsBitField } = require('discord.js');

module.exports = {
  has(member, perms) {
    const bits = perms.map(p => PermissionsBitField.Flags[p]).filter(Boolean);
    if (!bits.length) return true;
    return member.permissions.has(bits);
  }
};
