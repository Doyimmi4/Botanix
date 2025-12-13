const path = require('path');
const fs = require('fs');

module.exports = function registerEventHandler(client) {
  const base = path.join(__dirname, '..', 'events');
  if (!fs.existsSync(base)) return;
  const files = fs.readdirSync(base).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const evt = require(path.join(base, file));
    if (evt && evt.name && typeof evt.execute === 'function') {
      if (evt.once) client.once(evt.name, (...args) => evt.execute(client, ...args));
      else client.on(evt.name, (...args) => evt.execute(client, ...args));
    }
  }
};
