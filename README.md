# 🌸 Botanix - Cute Moderation Bot

A production-ready Discord.js v14 moderation bot with a cute, soft, cozy femboy aesthetic and enterprise-grade architecture.

## ✨ Features

- **🛡️ Advanced Moderation**: 23+ moderation commands with full logging
- **⚖️ Warning System**: Points-based system with auto-escalation
- **🔐 Security**: Multi-layer permission system with role hierarchy
- **⚡ Performance**: Shard-safe design with caching and optimization
- **🧑💻 Developer Tools**: Eval, reload, debug commands for developers
- **📋 Context Menus**: Quick moderation actions via right-click
- **📊 Comprehensive Logging**: Detailed action logging with pastel embeds

## 🚀 Quick Start

### Prerequisites
- Node.js 16.11.0 or higher
- Discord Bot Token
- Discord Application ID

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Botanix
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your bot token and settings
```

4. **Add your user ID to owners**
```javascript
// Edit src/config/owners.js
module.exports = {
  owners: ['YOUR_USER_ID_HERE'],
  // ... other settings
};
```

5. **Start the bot**
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DISCORD_TOKEN` | Your bot's token | ✅ | `MTQ0OTI2NjQ2OTk5NjMzNTE1NA...` |
| `CLIENT_ID` | Your bot's application ID | ✅ | `1449266469996335154` |
| `NODE_ENV` | Environment mode | ❌ | `development` |
| `LOG_LEVEL` | Logging level | ❌ | `info` |
| `TEST_GUILD_ID` | Guild for instant commands | ❌ | `1449133116663791638` |

### Owner Configuration

Edit `src/config/owners.js`:

```javascript
module.exports = {
  owners: ['YOUR_USER_ID'],           // Full bot control
  developers: ['DEV_USER_ID'],        // Reload/debug access
  supportRoles: ['Support', 'Helper'], // Support role names
  moderatorRoles: ['Moderator', 'Mod', 'Staff', 'Admin']
};
```

## 🛡️ Permission System

### Access Levels
- **Owner (5)**: Full bot control, eval, maintenance mode
- **Developer (4)**: Reload commands, debug tools, bypass cooldowns
- **Admin (3)**: All moderation, server management
- **Moderator (2)**: Basic moderation commands
- **Support (1)**: View warnings, cases, limited tools
- **User (0)**: No special permissions

### Role Detection
Permissions are automatically detected based on:
1. User ID in owners/developers list
2. Guild ownership
3. Administrator permission
4. Role names matching configured moderator/support roles

## 📋 Commands (23 Total)

### 🛡️ Moderation Commands (13)
- `/ban <user> <reason> [delete_days] [silent]` - Ban a user
- `/unban <user_id> <reason>` - Unban a user by ID
- `/kick <user> <reason> [silent]` - Kick a user
- `/timeout <user> <duration> <reason> [silent]` - Timeout a user
- `/warn <user> <reason> [silent]` - Warn a user
- `/mute <user> <reason> [silent]` - Mute a user (role-based)
- `/unmute <user> [reason]` - Unmute a user
- `/purge <amount> [user] [reason]` - Bulk delete messages
- `/slowmode <seconds> [channel] [reason]` - Set channel slowmode
- `/lock [channel] [reason]` - Lock a channel
- `/unlock [channel] [reason]` - Unlock a channel
- `/nick <user> [nickname] [reason]` - Change user nickname

### 👑 Owner Commands (2)
- `/maintenance <enabled> [message]` - Toggle maintenance mode
- `/eval <code>` - Execute JavaScript code (sandboxed)

### 🔧 Developer Commands (2)
- `/reload <type>` - Reload bot components
- `/debug <type>` - Debug bot information

### 💬 Support Commands (4)
- `/ping` - Bot latency and status
- `/test` - Simple test command
- `/warnings <user>` - View user warnings
- `/case <case_id>` - Look up moderation case

### 📋 Context Menus (3)
**Right-click on user:**
- **Warn User** - Quick warning
- **Timeout User** - 10-minute timeout

**Right-click on message:**
- **Delete Message** - Quick message deletion

## 🎨 Bot Features

### Cute Aesthetic 🌸
- **Pastel color scheme** (Light Pink, Pale Green, Lavender)
- **Soft emojis** throughout all commands
- **Cozy femboy aesthetic** with love and care
- **Beautiful embeds** with consistent styling

### Security & Validation
- **Role hierarchy respect** - Cannot moderate higher roles
- **Permission double-checking** - Validates before every action
- **Input sanitization** - Cleans all user inputs
- **Blacklist system** - Block problematic users/guilds
- **Cooldown protection** - Prevents command spam

### Logging System
- **Case ID tracking** - Unique ID for every action
- **DM notifications** - Automatic user notifications
- **Comprehensive logs** - File and console logging
- **Moderation history** - Full audit trail
- **Error handling** - Graceful failure recovery

## 🛠️ Development

### Project Structure
```
src/
├── index.js                    # Entry point
├── client.js                   # Main client class
├── config/                     # Configuration files
│   ├── bot.js                  # Bot settings & colors
│   ├── permissions.js          # Permission levels
│   ├── owners.js              # Access control
│   ├── emojis.js              # Emoji definitions
│   └── roles.js               # Role management
├── handlers/                   # Command/event handlers
│   ├── slashHandler.js        # Slash command loader
│   ├── contextHandler.js      # Context menu loader
│   ├── eventHandler.js        # Event loader
│   └── errorHandler.js        # Error management
├── commands/                   # Slash commands
│   ├── moderation/            # Moderation commands
│   ├── owner/                 # Owner-only commands
│   ├── dev/                   # Developer commands
│   └── support/               # Support commands
├── contexts/                   # Context menu commands
│   ├── user/                  # User context menus
│   └── message/               # Message context menus
├── events/                     # Discord events
│   ├── ready.js               # Bot ready event
│   └── interactionCreate.js   # Interaction handler
├── services/                   # Business logic
│   └── moderationService.js   # Moderation management
├── utils/                      # Utility functions
│   ├── logger.js              # Logging system
│   ├── embeds.js              # Embed utilities
│   ├── permissions.js         # Permission utilities
│   ├── cooldowns.js           # Cooldown management
│   ├── checks.js              # Input validation
│   ├── constants.js           # Constants & regex
│   └── deploy.js              # Command deployment
└── stores/                     # Data storage (future)
```

### Adding Commands

Create a new command file:

```javascript
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');
const config = require('../../config/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Example command 🌸')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Target user')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  permission: config.levels.MODERATOR,
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  cooldown: 5000,
  defer: true,
  
  async execute(interaction, client) {
    // Command logic here
    const embed = EmbedUtils.success('Command executed! 🌸');
    await interaction.editReply({ embeds: [embed] });
  }
};
```

### Deploying Commands

```bash
# Deploy to specific guild (instant)
node src/utils/deploy.js

# Or restart the bot to auto-deploy
npm start
```

## 🔒 Security Features

- **Sandboxed eval** - Safe code execution for owners
- **Permission validation** - Double-check permissions before actions
- **Role hierarchy** - Respect Discord's role hierarchy
- **Input sanitization** - Clean and validate all inputs
- **Rate limiting** - Built-in cooldown system
- **Blacklist system** - Block users/guilds from using bot
- **Error boundaries** - Graceful error handling

## 📊 Monitoring & Stats

Access via `/debug stats`:
- Commands executed
- Moderation actions taken
- Memory usage
- Uptime tracking
- Guild/user counts
- Shard information

## 🎨 Customization

### Colors (src/config/bot.js)
```javascript
colors: {
  primary: 0xFFB6C1,    // Light Pink
  success: 0x98FB98,    // Pale Green
  warning: 0xFFE4B5,    // Moccasin
  error: 0xFFB6C1,      // Light Pink (soft)
  info: 0xE6E6FA,       // Lavender
  moderation: 0xDDA0DD  // Plum
}
```

### Emojis (src/config/emojis.js)
```javascript
module.exports = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  botanix: '🌸',
  // ... more emojis
};
```

## 🆘 Troubleshooting

### Common Issues

**Commands not appearing:**
- Add `TEST_GUILD_ID` to `.env` for instant registration
- Wait up to 1 hour for global commands
- Check bot has `applications.commands` scope

**Bot not responding:**
- Ensure bot is running (`npm start`)
- Check bot permissions in server
- Verify token is correct in `.env`

**Permission errors:**
- Bot role must be above managed roles
- Check required permissions in channel
- Verify user has correct permission level

### Getting Help

1. Check console logs for errors
2. Use `/debug` commands for information
3. Check `logs/botanix.log` for detailed logs
4. Verify configuration in `src/config/`

## 📄 License

This project is licensed under the MIT License.

## 🌸 Made with Love

Botanix is crafted with care to provide a cute, cozy, and powerful moderation experience for your Discord server. The femboy aesthetic combined with enterprise-grade architecture makes it both adorable and reliable.

**Current Status:** ✅ **23 Commands Ready** | 🌸 **Fully Functional** | 💖 **Production Ready**

---

*"Protecting your garden with love and care" 🌸*