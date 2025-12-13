# 🌸 Botanix - ShardCloud Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. **Discord Bot Setup**
- ✅ Create bot at [Discord Developer Portal](https://discord.com/developers/applications)
- ✅ Get Bot Token and Client ID
- ✅ Enable required intents:
  - Server Members Intent
  - Message Content Intent
  - Presence Intent (optional)

### 2. **Bot Permissions**
Required bot permissions for full functionality:
```
Administrator (recommended)
OR individual permissions:
- Manage Server
- Manage Roles
- Manage Channels
- Manage Messages
- Ban Members
- Kick Members
- Moderate Members
- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use External Emojis
- Add Reactions
```

## 🚀 ShardCloud Deployment Steps

### 1. **Create ShardCloud Account**
- Go to [ShardCloud.app](https://shardcloud.app)
- Sign up for free account
- Verify email

### 2. **Deploy Bot**
1. Click "New Project"
2. Connect your GitHub repository
3. Select this repository
4. Choose "Node.js" runtime

### 3. **Environment Variables**
Set these in ShardCloud dashboard:

**Required:**
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
```

**Optional:**
```
NODE_ENV=production
LOG_LEVEL=info
TEST_GUILD_ID=your_test_server_id
MAINTENANCE_MODE=false
```

### 4. **Owner Configuration**
After deployment, update `src/config/owners.js`:
```javascript
owners: ['YOUR_DISCORD_USER_ID']
```

## 🔧 Configuration

### **Free Tier Limits**
- ✅ 512MB RAM
- ✅ 0.5 CPU cores
- ✅ Always-on hosting
- ✅ Custom domains
- ✅ Environment variables

### **Optimizations for Free Tier**
- Reduced logging in production
- Optimized memory usage
- Efficient caching
- Graceful shutdown handling

## 📊 Monitoring

### **Logs**
- View logs in ShardCloud dashboard
- Structured JSON logging
- Error tracking and alerts

### **Health Checks**
- Automatic health monitoring
- Restart on failure
- Uptime tracking

## 🛠️ Post-Deployment

### 1. **Test Bot**
- Invite bot to test server
- Run `/ping` command
- Test moderation commands

### 2. **Configure Permissions**
- Set up moderator roles
- Configure channel permissions
- Test command access levels

### 3. **Invite to Servers**
Use this invite link (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

## 🔄 Updates

### **Automatic Deployment**
- Push to main branch
- ShardCloud auto-deploys
- Zero-downtime updates

### **Manual Deployment**
1. Go to ShardCloud dashboard
2. Click "Deploy"
3. Select branch/commit
4. Deploy

## 🆘 Troubleshooting

### **Common Issues**

**Bot not responding:**
- Check environment variables
- Verify bot token
- Check bot permissions

**Commands not showing:**
- Wait up to 1 hour for global commands
- Use TEST_GUILD_ID for instant commands
- Check CLIENT_ID is correct

**Memory issues:**
- Monitor memory usage
- Optimize cache settings
- Reduce log level

### **Support**
- ShardCloud Discord: [discord.gg/shardcloud](https://discord.gg/shardcloud)
- Documentation: [docs.shardcloud.app](https://docs.shardcloud.app)

## 🌸 Success!

Your Botanix bot is now running 24/7 on ShardCloud! 

**Features Available:**
- ✅ 30+ moderation commands
- ✅ Context menu actions
- ✅ Advanced logging
- ✅ Rate limiting
- ✅ Caching system
- ✅ Cute femboy aesthetic 💖

*"Protecting gardens everywhere with love and care" 🌸*