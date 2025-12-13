const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');
const validator = require('validator');

class BotanixSetup {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.ownersPath = path.join(process.cwd(), 'src/config/owners.js');
  }

  async run() {
    console.clear();
    
    const banner = boxen(
      chalk.hex('#FFB6C1').bold('🌸 Botanix Setup Wizard 🌸\n\n') +
      chalk.hex('#98FB98')('Welcome to the interactive setup!\n') +
      chalk.hex('#E6E6FA')('This will help you configure your bot quickly and easily.'),
      {
        padding: 2,
        margin: 1,
        borderStyle: 'round',
        borderColor: '#FFB6C1'
      }
    );
    
    console.log(banner);

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: '🤖 Enter your Discord bot token:',
        validate: (input) => {
          if (!input) return 'Token is required!';
          if (input.length < 50) return 'Invalid token format!';
          return true;
        }
      },
      {
        type: 'input',
        name: 'clientId',
        message: '🆔 Enter your bot\'s Client ID:',
        validate: (input) => {
          if (!input) return 'Client ID is required!';
          if (!validator.isNumeric(input)) return 'Client ID must be numeric!';
          if (input.length < 17 || input.length > 19) return 'Invalid Client ID format!';
          return true;
        }
      },
      {
        type: 'input',
        name: 'ownerId',
        message: '👑 Enter your Discord User ID (for owner permissions):',
        validate: (input) => {
          if (!input) return 'Owner ID is required!';
          if (!validator.isNumeric(input)) return 'User ID must be numeric!';
          if (input.length < 17 || input.length > 19) return 'Invalid User ID format!';
          return true;
        }
      },
      {
        type: 'input',
        name: 'testGuildId',
        message: '🏰 Enter test guild ID (optional, for instant command deployment):',
        validate: (input) => {
          if (!input) return true; // Optional
          if (!validator.isNumeric(input)) return 'Guild ID must be numeric!';
          if (input.length < 17 || input.length > 19) return 'Invalid Guild ID format!';
          return true;
        }
      },
      {
        type: 'list',
        name: 'environment',
        message: '🔧 Select environment:',
        choices: [
          { name: 'Development (more logging)', value: 'development' },
          { name: 'Production (optimized)', value: 'production' }
        ]
      },
      {
        type: 'confirm',
        name: 'dashboard',
        message: '🌐 Enable web dashboard?',
        default: true
      }
    ]);

    await this.createEnvFile(answers);
    await this.updateOwnersFile(answers.ownerId);
    
    const successBox = boxen(
      chalk.green.bold('✅ Setup Complete!\n\n') +
      chalk.white('Your bot is now configured and ready to run.\n\n') +
      chalk.yellow('Next steps:\n') +
      chalk.white('1. Run: npm install\n') +
      chalk.white('2. Run: npm start\n') +
      chalk.white('3. Invite your bot to a server\n\n') +
      chalk.hex('#FFB6C1')('🌸 Happy moderating! 🌸'),
      {
        padding: 2,
        margin: 1,
        borderStyle: 'double',
        borderColor: '#98FB98'
      }
    );
    
    console.log(successBox);
  }

  async createEnvFile(answers) {
    const envContent = `# Bot Configuration
DISCORD_TOKEN=${answers.token}
CLIENT_ID=${answers.clientId}

# Environment
NODE_ENV=${answers.environment}

# Logging
LOG_LEVEL=${answers.environment === 'development' ? 'debug' : 'info'}
LOG_FILE=logs/botanix.log

# Guild for instant command registration
${answers.testGuildId ? `TEST_GUILD_ID=${answers.testGuildId}` : '# TEST_GUILD_ID=your_guild_id_here'}

# Dashboard
${answers.dashboard ? 'DASHBOARD_PORT=3000' : '# DASHBOARD_PORT=3000'}

# Maintenance
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=Botanix is currently under maintenance. Please try again later! 🌸

# Cache Settings
CACHE_TTL=300000
MAX_CACHE_SIZE=1000
`;

    fs.writeFileSync(this.envPath, envContent);
    console.log(chalk.green('✅ Created .env file'));
  }

  async updateOwnersFile(ownerId) {
    const ownersContent = `module.exports = {
  // Bot owners (highest access level)
  owners: [
    '${ownerId}' // Your user ID
  ],

  // Developers (can reload, debug, access dev commands)
  developers: [
    // Add developer user IDs here
  ],

  // Support role names per guild (can access support commands)
  supportRoles: [
    'Botanix Support',
    'Bot Support',
    'Support Team',
    'Helper'
  ],

  // Moderator role names (can access moderation commands)
  moderatorRoles: [
    'Moderator',
    'Mod',
    'Staff',
    'Admin',
    'Administrator'
  ],

  // Blacklisted guilds (bot will leave these)
  blacklistedGuilds: [
    // Add guild IDs here
  ],

  // Blacklisted users (cannot use bot)
  blacklistedUsers: [
    // Add user IDs here
  ]
};`;

    fs.writeFileSync(this.ownersPath, ownersContent);
    console.log(chalk.green('✅ Updated owners configuration'));
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new BotanixSetup();
  setup.run().catch(console.error);
}

module.exports = BotanixSetup;