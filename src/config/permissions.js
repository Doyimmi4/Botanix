module.exports = {
  // Mapping of command -> required Discord perms (bitfields)
  moderation: {
    ban: ['BanMembers'],
    softban: ['BanMembers'],
    tempban: ['BanMembers'],
    massban: ['BanMembers'],
    unban: ['BanMembers'],
    kick: ['KickMembers'],
    multikick: ['KickMembers'],
    mute: ['ModerateMembers'],
    tempmute: ['ModerateMembers'],
    unmute: ['ModerateMembers'],
    timeout: ['ModerateMembers'],
    removetimeout: ['ModerateMembers'],
    warn: ['ModerateMembers'],
    purge: ['ManageMessages'],
    slowmode: ['ManageChannels'],
    lock: ['ManageChannels'],
    nick: ['ManageNicknames'],
    roleadd: ['ManageRoles'],
    roleremove: ['ManageRoles'],
    massrole: ['ManageRoles'],
    raidmode: ['Administrator'],
    serverlock: ['Administrator'],
  },
  system: {
    ping: [],
    uptime: [],
    status: [],
    botinfo: [],
    shardinfo: [],
  }
};
