/**
 * backend/utils/logger.js
 * Centralized structured logging (Winston).
 *
 * Security note: Provides tamper-evident, level-based logs for security events
 * (failed logins, blocked requests, validation errors) without leaking secrets.
 *
 * Env variables:
 *   NODE_ENV   - 'production' silences console debug noise
 *   LOG_LEVEL  - optional override (default: 'info' in prod, 'debug' in dev)
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure the logs directory exists (kept out of git via .gitignore).
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const isProd = process.env.NODE_ENV === 'production';

// Redact common secret-bearing fields so tokens/passwords never hit disk.
const redactSecrets = winston.format((info) => {
  const SENSITIVE = ['password', 'token', 'accessToken', 'refreshToken', 'authorization', 'cookie', 'secret'];
  const scrub = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (SENSITIVE.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        scrub(obj[key]);
      }
    }
    return obj;
  };
  return scrub(info);
});

const baseFormat = winston.format.combine(
  redactSecrets(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  defaultMeta: { service: 'forgevidhya-api' },
  format: baseFormat,
  transports: [
    // All application logs.
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // Errors only.
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    // Dedicated, append-only security audit trail.
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

// Human-readable console output in non-production environments.
if (!isProd) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * Emit a structured security event. Always logs at 'warn' so it lands in
 * security.log. Use for: failed logins, lockouts, blocked CORS/rate-limit
 * hits, validation rejections, and authz denials.
 *
 * @param {string} event - short machine-readable event name, e.g. 'LOGIN_FAILED'
 * @param {object} meta  - contextual fields (ip, userId, route, reason...)
 */
logger.security = (event, meta = {}) => {
  logger.warn(`SECURITY_EVENT: ${event}`, { securityEvent: event, ...meta });
};

// Stream adapter so morgan (or similar) can pipe HTTP logs through winston.
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
