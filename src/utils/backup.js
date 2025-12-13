const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

class BackupManager {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = uuidv4().split('-')[0];
    const backupName = `botanix-backup-${timestamp}-${backupId}`;
    const backupPath = path.join(this.backupDir, `${backupName}.json`);

    logger.startSpinner('Creating backup...');

    try {
      const backupData = {
        id: backupId,
        timestamp: new Date().toISOString(),
        version: require('../../package.json').version,
        config: this.backupConfig(),
        logs: this.backupLogs(),
        stats: this.backupStats()
      };

      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      logger.stopSpinner('✅', `Backup created: ${backupName}.json`);
      return { success: true, path: backupPath, id: backupId };
    } catch (error) {
      logger.stopSpinner('❌', 'Backup failed');
      logger.error('Backup creation failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  backupConfig() {
    try {
      const configFiles = [
        'src/config/bot.js',
        'src/config/permissions.js',
        'src/config/owners.js',
        'src/config/emojis.js',
        'src/config/roles.js'
      ];

      const config = {};
      configFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          config[file] = fs.readFileSync(filePath, 'utf8');
        }
      });

      return config;
    } catch (error) {
      logger.warn('Failed to backup config:', { error: error.message });
      return {};
    }
  }

  backupLogs() {
    try {
      const logsPath = path.join(process.cwd(), 'logs', 'botanix.log');
      if (fs.existsSync(logsPath)) {
        const logs = fs.readFileSync(logsPath, 'utf8');
        return logs.split('\n').slice(-100).join('\n'); // Last 100 lines
      }
      return '';
    } catch (error) {
      logger.warn('Failed to backup logs:', { error: error.message });
      return '';
    }
  }

  backupStats() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created - a.created);

      return files;
    } catch (error) {
      logger.error('Failed to list backups:', { error: error.message });
      return [];
    }
  }

  cleanOldBackups(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const backups = this.listBackups();
      const now = Date.now();
      let cleaned = 0;

      backups.forEach(backup => {
        if (now - backup.created.getTime() > maxAge) {
          fs.unlinkSync(backup.path);
          cleaned++;
        }
      });

      if (cleaned > 0) {
        logger.info(`🧹 Cleaned ${cleaned} old backup(s)`);
      }

      return cleaned;
    } catch (error) {
      logger.error('Failed to clean old backups:', { error: error.message });
      return 0;
    }
  }
}

// If called directly
if (require.main === module) {
  const backup = new BackupManager();
  backup.createBackup().then(result => {
    if (result.success) {
      console.log(`Backup created successfully: ${result.id}`);
    } else {
      console.error(`Backup failed: ${result.error}`);
    }
  });
}

module.exports = BackupManager;