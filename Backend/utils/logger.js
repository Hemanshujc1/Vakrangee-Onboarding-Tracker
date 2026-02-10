const winston = require('winston');
const path = require('path');
const fs = require('fs');
require('winston-daily-rotate-file');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom Format for clearer debugging
const logFormat = winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
  const stackTrace = stack ? `\n${stack}` : '';
  const { service, ...rest } = meta;
  const metaString = Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${stackTrace}${metaString}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }), // capture stack trace
    winston.format.splat(),
    logFormat 
  ),
  defaultMeta: { service: 'onboarding-portal-backend' },
  transports: [
    new winston.transports.DailyRotateFile({ 
      filename: path.join(logDir, 'error-%DATE%.log'), 
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
    new winston.transports.DailyRotateFile({ 
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});


// Always log to console for better observability in containerized/PM2 environments
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    logFormat
  ),
}));

// Stream for morgan
logger.stream = {
  write: function(message, encoding) {
    logger.info(message.trim());
  },
};

module.exports = logger;
