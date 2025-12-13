const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const figlet = require('figlet');
const gradient = require('gradient-string');
const cliProgress = require('cli-progress');
const boxen = require('boxen');
const ora = require('ora');
const { table } = require('table');
const humanizeDuration = require('humanize-duration');
const prettyBytes = require('pretty-bytes');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class BotanixLogger {
  constructor() {
    this.logFile = path.join(logsDir, 'botanix.log');
    this.colors = {
      primary: '#FFB6C1',
      success: '#98FB98', 
      warning: '#FFE4B5',
      error: '#FF6B6B',
      info: '#E6E6FA',
      moderation: '#DDA0DD',
      kawaii: '#FF69B4',
      uwu: '#FF1493'
    };
    this.progressBar = null;
    this.spinner = null;
  }

  getTimestamp() {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  writeToFile(level, message, extra = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...extra
    };
    
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      // Silent fail
    }
  }

  formatMessage(emoji, color, level, message, extra = {}) {
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
    const levelText = chalk.hex(color).bold(`${emoji} ${level.toUpperCase()}`);
    const msg = chalk.white(message);
    
    let output = `${timestamp} ${levelText} ${msg}`;
    
    if (Object.keys(extra).length > 0) {
      const extraStr = JSON.stringify(extra, null, 2)
        .split('\n')
        .map(line => chalk.dim(`    ${line}`))
        .join('\n');
      output += `\n${extraStr}`;
    }
    
    return output;
  }

  // Enhanced banner with figlet
  async banner() {
    return new Promise((resolve) => {
      figlet('Botanix', {
        font: 'Small',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      }, (err, data) => {
        if (err) {
          this.simpleBanner();
          resolve();
          return;
        }
        
        const gradientBanner = gradient(['#FFB6C1', '#FF69B4', '#DDA0DD'])(data);
        console.log('\n' + gradientBanner);
        
        const subtitle = boxen(
          chalk.hex('#98FB98')('🌸 Cute Moderation Bot 🌸\n') +
          chalk.hex('#E6E6FA')('Made with 💖 for cozy moderation\n') +
          chalk.hex('#FFE4B5')('Enterprise-grade • Femboy aesthetic • Production-ready'),
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: '#FFB6C1',
            backgroundColor: '#000000'
          }
        );
        
        console.log(subtitle);
        resolve();
      });
    });
  }

  simpleBanner() {
    const banner = boxen(
      gradient(['#FFB6C1', '#FF69B4'])('🌸 Botanix - Cute Moderation Bot 🌸\n\n') +
      chalk.hex('#98FB98')('Made with 💖 for cozy moderation\n') +
      chalk.hex('#E6E6FA')('Enterprise-grade • Femboy aesthetic • Production-ready'),
      {
        padding: 2,
        margin: 1,
        borderStyle: 'double',
        borderColor: '#FFB6C1'
      }
    );
    console.log('\n' + banner);
  }

  // Spinner methods
  startSpinner(text, color = 'magenta') {
    this.spinner = ora({
      text: chalk.hex(this.colors.primary)(text),
      color,
      spinner: 'hearts'
    }).start();
  }

  updateSpinner(text) {
    if (this.spinner) {
      this.spinner.text = chalk.hex(this.colors.primary)(text);
    }
  }

  stopSpinner(symbol = '✅', text = 'Done!') {
    if (this.spinner) {
      this.spinner.stopAndPersist({
        symbol: chalk.green(symbol),
        text: chalk.hex(this.colors.success)(text)
      });
      this.spinner = null;
    }
  }

  // Enhanced progress bar
  createProgressBar(total, label = 'Progress') {
    this.progressBar = new cliProgress.SingleBar({
      format: `🌸 ${label} |${chalk.hex(this.colors.primary)('{bar}')}| {percentage}% | {value}/{total} | ETA: {eta}s`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    });
    this.progressBar.start(total, 0);
    return this.progressBar;
  }

  updateProgress(value) {
    if (this.progressBar) {
      this.progressBar.update(value);
    }
  }

  stopProgress() {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
  }

  // Enhanced table
  createTable(data, config = {}) {
    const defaultConfig = {
      border: {
        topBody: '─',
        topJoin: '┬',
        topLeft: '┌',
        topRight: '┐',
        bottomBody: '─',
        bottomJoin: '┴',
        bottomLeft: '└',
        bottomRight: '┘',
        bodyLeft: '│',
        bodyRight: '│',
        bodyJoin: '│',
        joinBody: '─',
        joinLeft: '├',
        joinRight: '┤',
        joinJoin: '┼'
      },
      columnDefault: {
        paddingLeft: 1,
        paddingRight: 1
      }
    };
    
    const output = table(data, { ...defaultConfig, ...config });
    console.log(chalk.hex(this.colors.primary)(output));
  }

  // System info display
  displaySystemInfo() {
    const memUsage = process.memoryUsage();
    const data = [
      ['Property', 'Value'],
      ['Node.js Version', process.version],
      ['Platform', `${process.platform} ${process.arch}`],
      ['Memory (Heap Used)', prettyBytes(memUsage.heapUsed)],
      ['Memory (Heap Total)', prettyBytes(memUsage.heapTotal)],
      ['Memory (RSS)', prettyBytes(memUsage.rss)],
      ['Uptime', humanizeDuration(process.uptime() * 1000, { round: true })]
    ];
    
    this.createTable(data);
  }

  // Standard log methods with enhancements
  info(message, extra = {}) {
    const formatted = this.formatMessage('ℹ️', this.colors.info, 'info', message, extra);
    console.log(formatted);
    this.writeToFile('info', message, extra);
  }

  success(message, extra = {}) {
    const formatted = this.formatMessage('✅', this.colors.success, 'success', message, extra);
    console.log(formatted);
    this.writeToFile('success', message, extra);
  }

  warn(message, extra = {}) {
    const formatted = this.formatMessage('⚠️', this.colors.warning, 'warn', message, extra);
    console.log(formatted);
    this.writeToFile('warn', message, extra);
  }

  error(message, extra = {}) {
    const formatted = this.formatMessage('❌', this.colors.error, 'error', message, extra);
    console.log(formatted);
    this.writeToFile('error', message, extra);
  }

  debug(message, extra = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('🔍', '#9B59B6', 'debug', message, extra);
      console.log(formatted);
    }
    this.writeToFile('debug', message, extra);
  }

  // Botanix themed loggers
  botanix(message, extra = {}) {
    const formatted = this.formatMessage('🌸', this.colors.primary, 'botanix', message, extra);
    console.log(formatted);
    this.writeToFile('botanix', message, extra);
  }

  system(message, extra = {}) {
    const formatted = this.formatMessage('⚙️', '#3498DB', 'system', message, extra);
    console.log(formatted);
    this.writeToFile('system', message, extra);
  }

  command(message, extra = {}) {
    const formatted = this.formatMessage('💬', this.colors.success, 'command', message, extra);
    console.log(formatted);
    this.writeToFile('command', message, extra);
  }

  moderation(message, extra = {}) {
    const formatted = this.formatMessage('🛡️', this.colors.moderation, 'moderation', message, extra);
    console.log(formatted);
    this.writeToFile('moderation', message, extra);
  }

  dev(message, extra = {}) {
    const formatted = this.formatMessage('🔧', '#F39C12', 'dev', message, extra);
    console.log(formatted);
    this.writeToFile('dev', message, extra);
  }

  shard(message, extra = {}) {
    const formatted = this.formatMessage('🔗', this.colors.warning, 'shard', message, extra);
    console.log(formatted);
    this.writeToFile('shard', message, extra);
  }

  cache(message, extra = {}) {
    const formatted = this.formatMessage('💾', '#95A5A6', 'cache', message, extra);
    console.log(formatted);
    this.writeToFile('cache', message, extra);
  }

  kawaii(message, extra = {}) {
    const formatted = this.formatMessage('🥺', this.colors.kawaii, 'kawaii', message, extra);
    console.log(formatted);
    this.writeToFile('kawaii', message, extra);
  }

  uwu(message, extra = {}) {
    const formatted = this.formatMessage('💖', this.colors.uwu, 'uwu', message, extra);
    console.log(formatted);
    this.writeToFile('uwu', message, extra);
  }

  progress(current, total, label = 'Progress') {
    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r🌸 ${label}: [${bar}] ${percentage}%`);
    
    if (current === total) {
      console.log('');
    }
  }

  // Special startup sequence
  async startup() {
    if (process.env.NODE_ENV !== 'production') {
      console.clear();
    }
    await this.banner();
    this.botanix('Starting up with love and care... 💖');
  }

  // Enhanced ready message
  ready(botTag, guilds, users) {
    const readyBox = boxen(
      chalk.hex(this.colors.success).bold('🌸 Ready to moderate with love! 🌸\n\n') +
      chalk.hex(this.colors.info)(`👤 Logged in as: ${chalk.bold(botTag)}\n`) +
      chalk.hex(this.colors.info)(`🏰 Serving ${chalk.bold(guilds)} guilds with ${chalk.bold(users)} users\n`) +
      chalk.hex(this.colors.primary)('💖 Protecting gardens everywhere 💖'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: this.colors.success,
        textAlignment: 'center'
      }
    );
    
    console.log(readyBox);
  }

  // Separator with gradient
  separator(char = '─', length = 50) {
    const line = char.repeat(length);
    console.log(gradient(['#FFB6C1', '#DDA0DD'])(line));
  }

  // Box message
  box(message, options = {}) {
    const defaultOptions = {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: this.colors.primary,
      textAlignment: 'center'
    };
    
    const boxed = boxen(message, { ...defaultOptions, ...options });
    console.log(boxed);
  }

  // Clear console
  clear() {
    console.clear();
  }
}

module.exports = new BotanixLogger();