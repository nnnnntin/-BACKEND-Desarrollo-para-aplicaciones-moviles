const winston = require("winston");
const Sentry = require("./instrument");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

logger.sentryError = (err) => {
  Sentry.captureException(err);
  logger.error(err.stack || err.message);
};

module.exports = logger;
