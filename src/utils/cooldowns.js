const { COOLDOWN_DEFAULT_MS } = require('../config/bot');

const map = new Map(); // key -> timestamp

module.exports = {
  check(key, ms = COOLDOWN_DEFAULT_MS) {
    const now = Date.now();
    const until = map.get(key) || 0;
    if (now < until) return until - now;
    map.set(key, now + ms);
    return 0;
  },
  clear(key) { map.delete(key); }
};
