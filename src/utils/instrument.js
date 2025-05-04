const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0, 
  serverName: process.env.SENTRY_SERVICE_NAME, 
  environment: process.env.NODE_ENV || "development",
  sendDefaultPii: true,
});

module.exports = Sentry;
