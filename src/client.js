const { Client, GatewayIntentBits, Partials, Collection, Options } = require('discord.js');
const path = require('path');
const logger = require('./utils/logger');
const registerEventHandler = require('./handlers/eventHandler');
const registerCommandHandler = require('./handlers/commandHandler');
const registerErrorHandler = require('./handlers/errorHandler');
const logHandler = require('./handlers/logHandler');
const { BOT_NAME, PREFIX } = require('./config/bot');

class BotanixClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.GuildMember, Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
      makeCache: Options.cacheWithLimits({
        // Conservative caches for production safety
        MessageManager: 200,
        GuildMemberManager: 2000,
        ThreadManager: 100,
      }),
      sweepers: {
        messages: {
          interval: 300,
          lifetime: 900,
        },
      },
      failIfNotExists: false,
    });

    // Collections
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();
    this.cooldowns = new Collection();

    // Config
    this.prefix = PREFIX;

    // State
    this.readyAtTs = null;
  }
}

const client = new BotanixClient();

// Attach logger and handlers
registerErrorHandler(client);
registerEventHandler(client);
registerCommandHandler(client);
logHandler.bootstrap(client);

client.once('ready', () => {
  client.readyAtTs = Date.now();
  logger.info({ shard: client.shard?.ids?.[0] ?? 0 }, `🌸 ${BOT_NAME} ready on ${client.guilds.cache.size} guilds`);
});

client.login(process.env.BOT_TOKEN).catch((err) => {
  logger.fatal({ err }, 'Login failed');
  process.exit(1);
});

module.exports = client;
