const { ActivityType } = require('discord.js');

class PresenceManager {
  constructor(client) {
    this.client = client;
    this.activities = [
      { name: 'over the garden 🌸', type: ActivityType.Watching },
      { name: 'cute moderation 💖', type: ActivityType.Playing },
      { name: 'with flowers 🌺', type: ActivityType.Playing },
      { name: 'for rule breakers 👀', type: ActivityType.Watching },
      { name: 'the server bloom 🌱', type: ActivityType.Watching },
      { name: 'soft music 🎵', type: ActivityType.Listening },
      { name: 'cozy vibes ✨', type: ActivityType.Playing },
      { name: 'members chat 💬', type: ActivityType.Listening },
      { name: 'femboy energy 🌙', type: ActivityType.Playing },
      { name: 'pastel dreams 🎨', type: ActivityType.Playing },
      { name: 'uwu sounds 🥺', type: ActivityType.Listening },
      { name: 'for troublemakers 😤', type: ActivityType.Watching },
      { name: 'kawaii moments 💕', type: ActivityType.Watching },
      { name: 'lo-fi beats 🎶', type: ActivityType.Listening },
      { name: 'in a flower field 🌻', type: ActivityType.Playing },
      { name: 'anime openings 🎤', type: ActivityType.Listening },
      { name: 'soft rain sounds 🌧️', type: ActivityType.Listening },
      { name: 'with plushies 🧸', type: ActivityType.Playing },
      { name: 'magical girl shows ✨', type: ActivityType.Watching },
      { name: 'cozy café vibes ☕', type: ActivityType.Playing }
    ];
    this.currentIndex = 0;
    this.interval = null;
  }

  start() {
    this.updatePresence();
    this.interval = setInterval(() => {
      this.updatePresence();
    }, 30000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  updatePresence() {
    if (!this.client.user) return;
    
    const activity = this.activities[this.currentIndex];
    
    this.client.user.setPresence({
      activities: [activity],
      status: 'online'
    });
    
    this.currentIndex = (this.currentIndex + 1) % this.activities.length;
  }

  setCustomPresence(name, type = ActivityType.Playing, status = 'online') {
    if (!this.client.user) return;
    
    this.client.user.setPresence({
      activities: [{ name, type }],
      status
    });
  }

  setMaintenancePresence() {
    if (!this.client.user) return;
    
    this.client.user.setPresence({
      activities: [{ name: 'Maintenance Mode 🔧', type: ActivityType.Playing }],
      status: 'dnd'
    });
  }

  setIdlePresence() {
    if (!this.client.user) return;
    
    this.client.user.setPresence({
      activities: [{ name: 'Taking a nap 🌙', type: ActivityType.Playing }],
      status: 'idle'
    });
  }

  addActivity(name, type = ActivityType.Playing) {
    this.activities.push({ name, type });
  }

  removeActivity(name) {
    this.activities = this.activities.filter(activity => activity.name !== name);
  }

  getActivities() {
    return this.activities;
  }
}

module.exports = PresenceManager;