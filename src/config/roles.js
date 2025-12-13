module.exports = {
  // Default role hierarchy positions
  hierarchy: {
    OWNER: 1000,
    ADMIN: 900,
    MODERATOR: 800,
    SUPPORT: 700,
    MEMBER: 100,
    MUTED: 50,
    BOT: 999
  },

  // Mute role configuration
  muteRole: {
    name: 'Muted',
    color: 0x808080,
    permissions: [],
    reason: 'Botanix mute role - automatically created'
  },

  // Auto-role settings
  autoRoles: {
    enabled: false,
    roles: [
      // Role IDs to assign on join
    ],
    delay: 5000 // 5 seconds delay
  },

  // Role management settings
  management: {
    // Roles that cannot be assigned/removed by bot
    protected: [
      'Owner',
      'Admin',
      'Botanix'
    ],
    
    // Maximum roles a user can have
    maxRoles: 20,
    
    // Roles that require confirmation
    dangerous: [
      'Admin',
      'Moderator',
      'Staff'
    ]
  },

  // Sticky roles (persist through leaves/joins)
  sticky: {
    enabled: true,
    exclude: [
      'Muted',
      'Temporary'
    ]
  }
};