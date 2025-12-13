const validator = require('validator');
const { v4: uuidv4 } = require('uuid');

class ValidationUtils {
  static isValidDiscordId(id) {
    return validator.isNumeric(id) && id.length >= 17 && id.length <= 19;
  }

  static isValidUrl(url) {
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true
    });
  }

  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  static sanitizeInput(input, options = {}) {
    if (typeof input !== 'string') return '';
    
    let sanitized = validator.escape(input);
    
    if (options.trim) sanitized = sanitized.trim();
    if (options.maxLength) sanitized = sanitized.substring(0, options.maxLength);
    if (options.removeSpecialChars) {
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    return sanitized;
  }

  static validateReason(reason, maxLength = 512) {
    if (!reason) return 'No reason provided';
    
    const sanitized = this.sanitizeInput(reason, { 
      trim: true, 
      maxLength 
    });
    
    return sanitized || 'No reason provided';
  }

  static validateDuration(duration) {
    const timeRegex = /^(\d+)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hour|hours|d|day|days|w|week|weeks)$/i;
    return timeRegex.test(duration);
  }

  static generateCaseId() {
    return uuidv4().split('-')[0].toUpperCase();
  }

  static isValidHexColor(color) {
    return validator.isHexColor(color);
  }

  static validatePermissionLevel(level) {
    return validator.isInt(level.toString(), { min: 0, max: 5 });
  }

  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = ValidationUtils;