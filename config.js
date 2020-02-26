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

const requiredInProduction = { requireInProduction: true }

module.exports = {
  sessionSecret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
  db: {
    username: get('DATABASE_USER', 'check-my-diary'),
    password: get('DATABASE_PASSWORD', 'check-my-diary'),
    server: get('DATABASE_HOST', 'localhost'),
    database: get('DATABASE_NAME', 'check-my-diary'),
    sslEnabled: get('DB_SSL_ENABLED', 'false'),
  },
  nomis: {
    authUrl: get('API_AUTH_ENDPOINT_URL', get('NOMIS_AUTH_URL', 'http://localhost:9090/auth')),
    authExternalUrl: get('API_AUTH_EXTERNAL_ENDPOINT_URL', get('API_AUTH_ENDPOINT_URL', 'http://localhost:9090/auth')),
    timeout: {
      response: 30000,
      deadline: 35000,
    },
    agent: {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    },
    apiClientId: get('API_CLIENT_ID', 'my-diary', requiredInProduction),
    apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
  },
  app: {
    production,
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
