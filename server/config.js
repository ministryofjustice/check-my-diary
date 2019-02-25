const production = process.env.NODE_ENV === 'production';

function get(name, fallback, options = {}) {
  if (process.env[name]) {
    return process.env[name];
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback;
  }
  throw new Error(`Missing env var ${name}`);
}

module.exports = {
  sessionSecret: get('SESSION_SECRET', 'app-insecure-default-session', { requireInProduction: true }),
  app: {
    production: production,
    notmEndpointUrl: process.env.NN_ENDPOINT_URL || 'http://localhost:3000/',
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk'
  },
  analytics: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
    expiryMinutes: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES || 20
  }
};
