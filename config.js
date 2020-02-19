require('dotenv').config()

const production = process.env.NODE_ENV === 'production'

function get(name, fallback, options = {}) {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

module.exports = {
  sessionSecret: get('SESSION_SECRET', 'app-insecure-default-session', { requireInProduction: true }),
  db: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    sslEnabled: 'false',
  },
  nomis: {
    authUrl: process.env.API_AUTH_ENDPOINT_URL,
    authExternalUrl: process.env.API_AUTH_ENDPOINT_URL,
    timeout: {
      response: 30000,
      deadline: 35000,
    },
    agent: {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    },
    apiClientId: process.env.API_CLIENT_ID,
    apiClientSecret: process.env.API_CLIENT_SECRET,
  },
  app: {
    production,
    notmEndpointUrl: process.env.NN_ENDPOINT_URL || 'http://localhost:3000/',
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
  },
  log: {
    fileLocation: process.env.LOG_FILE_LOCATION,
    level: process.env.LOG_LEVEL,
    period: process.env.LOG_PERIOD,
    numberOfLogFilesToKeep: process.env.LOG_NUMBER_OF_FILES_TO_KEEP,
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  notify: {
    clientKey: process.env.NOTIFY_CLIENT_KEY,
    smsTemplateId: process.env.NOTIFY_SMS_TEMPLATE,
    emailTemplateId: process.env.NOTIFY_EMAIL_TEMPLATE,
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'hmpps-session-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'localhost',
    expiryMinutes: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES || 20,
  },
  port: process.env.PORT,
  domain: process.env.HMPPS_COOKIE_DOMAIN,
  sessionTimeout: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES,
  quantumAddresses: process.env.QUANTUM_ADDRESS,
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED,
  twoFactorAuthOn: process.env.TWO_FACT_AUTH_ON,
  notifyHealthCheckUrl: process.env.NOTIFY_HEALTH_CHECK_URL,
  https: production,
}
