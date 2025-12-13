const { SlashCommandBuilder } = require('discord.js');
const EmbedUtils = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check Botanix\'s status and performance 🏓'),
  
  cooldown: 3000,
  defer: true,
  
  async execute(interaction, client) {
    const startTime = Date.now();
    
    // Calculate various latencies
    const apiLatency = Math.round(client.ws.ping);
    const botLatency = Date.now() - interaction.createdTimestamp;
    
    // Get system info
    const uptime = client.getUptime();
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const totalMemory = Math.round(process.memoryUsage().rss / 1024 / 1024);
    
    // Performance indicators
    const getPerformanceEmoji = (ping) => {
      if (ping < 100) return '🟢';
      if (ping < 200) return '🟡';
      return '🔴';
    };
    
    const embed = EmbedUtils.info('', '🏓 Botanix Status')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { 
          name: '🏓 API Latency', 
          value: `${getPerformanceEmoji(apiLatency)} ${apiLatency}ms`, 
          inline: true 
        },
        { 
          name: '⚡ Bot Latency', 
          value: `${getPerformanceEmoji(botLatency)} ${botLatency}ms`, 
          inline: true 
        },
        { 
          name: '🕐 Uptime', 
          value: EmbedUtils.formatUptime(uptime), 
          inline: true 
        },
        { 
          name: '💾 Memory Usage', 
          value: `${memoryUsage}MB / ${totalMemory}MB`, 
          inline: true 
        },
        { 
          name: '🏰 Guilds', 
          value: `${client.guilds.cache.size}`, 
          inline: true 
        },
        { 
          name: '👥 Users', 
          value: `${client.users.cache.size}`, 
          inline: true 
        },
        { 
          name: '📊 Commands Executed', 
          value: `${client.stats.commandsExecuted}`, 
          inline: true 
        },
        { 
          name: '🛡️ Moderation Actions', 
          value: `${client.stats.moderationActions}`, 
          inline: true 
        },
        { 
          name: '📚 Discord.js', 
          value: `v${require('discord.js').version}`, 
          inline: true 
        }
      )
      .addFields({
        name: '🌸 Status',
        value: client.maintenanceMode 
          ? '🔧 Maintenance Mode' 
          : '💖 Online and ready to moderate!',
        inline: false
      });
    
    // Add shard info if sharded
    if (client.shard) {
      embed.addFields({
        name: '🔗 Shard',
        value: `${client.shard.ids.join(', ')} / ${client.shard.count}`,
        inline: true
      });
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    embed.setFooter({ 
      text: `Response time: ${responseTime}ms • Made with 💖`, 
      iconURL: client.user.displayAvatarURL() 
    });
    
    await interaction.editReply({ embeds: [embed] });
  }
};