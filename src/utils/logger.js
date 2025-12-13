const pino = require('pino');
const dayjs = require('dayjs');
const chalk = require('chalk');

const transport = process.env.NODE_ENV === 'production'
  ? undefined
  : pino.transport({ target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } });

const baseLogger = pino({ level: process.env.LOG_LEVEL || 'info' }, transport);

function fmtLevel(level) {
  const map = { fatal: '🔴', error: '🔺', warn: '🟡', info: '🟢', debug: '🔍', trace: '🗒️' };
  return map[level] || 'ℹ️';
}

function log(level, obj, msg) {
  const ts = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const shard = obj?.shard != null ? `S${obj.shard}` : 'S?';
  const guild = obj?.guild ? ` ${chalk.hex('#cba6f7')}[${obj.guild}]` : '';
  const emoji = fmtLevel(level);
  const line = `${chalk.hex('#94e2d5')(ts)} ${emoji} ${chalk.hex('#fab387')(shard)} ${msg}` + guild;
  baseLogger[level](obj || {}, line);
}

module.exports = {
  fatal: (obj, msg) => log('fatal', obj, msg),
  error: (obj, msg) => log('error', obj, msg),
  warn: (obj, msg) => log('warn', obj, msg),
  info: (obj, msg) => log('info', obj, msg),
  debug: (obj, msg) => log('debug', obj, msg),
};
