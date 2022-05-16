require('dotenv').config()

const production = process.env.NODE_ENV === 'production'

const get = (name, fallback, { requireInProduction, noFallbackInProduction } = {}) => {
  if (process.env[name]) return process.env[name]

  if (production && noFallbackInProduction) return undefined

  if (fallback !== undefined && !(production && requireInProduction)) return fallback

  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }
const noFallbackInProduction = { noFallbackInProduction: true }

module.exports = {
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 20)),
  },
  db: {
    username: get('DATABASE_USER', 'check-my-diary'),
    password: get('DATABASE_PASSWORD', 'check-my-diary'),
    server: get('DATABASE_HOST', 'localhost'),
    database: get('DATABASE_NAME', 'check-my-diary'),
    sslEnabled: get('DB_SSL_ENABLED', 'false'),
  },
  redis: {
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  apis: {
    hmppsAuth: {
      url: get('API_AUTH_ENDPOINT_URL', get('NOMIS_AUTH_URL', 'http://localhost:9191/auth')),
      externalUrl: get('API_AUTH_EXTERNAL_ENDPOINT_URL', get('API_AUTH_ENDPOINT_URL', 'http://localhost:9191/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 35000)),
      },
      agent: {
        timeout: 10000,
        freeSocketTimeout: 30000,
      },
      apiClientId: get('API_CLIENT_ID', 'my-diary', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: {
        timeout: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
      },
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  app: {
    production,
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
    url: process.env.CHECK_MY_DIARY_URL || `http://localhost:${process.env.PORT || 3005}`,
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  notify: {
    url: get('NOTIFY_URL', 'http://localhost:9191', noFallbackInProduction),
    clientKey: get('NOTIFY_CLIENT_KEY', 'some_invalid_key', requiredInProduction),
    smsTemplateId: get('NOTIFY_SMS_TEMPLATE', 'not_sms', requiredInProduction),
    emailTemplateId: get('NOTIFY_EMAIL_TEMPLATE', 'not_email', requiredInProduction),
    healthCheckUrl: process.env.NOTIFY_HEALTH_CHECK_URL || 'https://api.notifications.service.gov.uk/_status',
  },
  cmdApi: {
    url: get('CMD_API_URL', 'http://localhost:9191'),
  },
  port: get('PORT', 3005, requiredInProduction),
  domain: process.env.HMPPS_COOKIE_DOMAIN,
  sessionTimeout: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES,
  quantumAddresses: get('QUANTUM_ADDRESS', '127.0.0.1', requiredInProduction),
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED,
  twoFactorAuthOn: process.env.TWO_FACT_AUTH_ON,
  https: production,
  regions: get('REGIONS', '', requiredInProduction),
}
