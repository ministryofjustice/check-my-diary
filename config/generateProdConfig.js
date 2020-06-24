const { envOrThrow, envOr, envListOr } = require('./utils')

module.exports = () => ({
  sessionSecret: envOrThrow('SESSION_SECRET'),
  db: {
    username: envOr('DATABASE_USER', 'check-my-diary'),
    password: envOr('DATABASE_PASSWORD', 'check-my-diary'),
    server: envOr('DATABASE_HOST', 'localhost'),
    database: envOr('DATABASE_NAME', 'check-my-diary'),
    sslEnabled: envOr('DB_SSL_ENABLED', 'false'),
  },
  nomis: {
    authUrl: envListOr(['API_AUTH_ENDPOINT_URL', 'NOMIS_AUTH_URL']),
    authExternalUrl: envListOr(['API_AUTH_EXTERNAL_ENDPOINT_URL', 'API_AUTH_ENDPOINT_URL']),
    timeout: {
      response: 30000,
      deadline: 35000,
    },
    agent: {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    },
    apiClientId: envOrThrow('API_CLIENT_ID'),
    apiClientSecret: envOrThrow('API_CLIENT_SECRET'),
  },
  app: {
    production: true,
    mailTo: envOr('MAIL_TO', 'feedback@digital.justice.gov.uk'),
    url: envOrThrow('CHECK_MY_DIARY_URL'),
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  notify: {
    clientKey: envOrThrow('NOTIFY_CLIENT_KEY'),
    smsTemplateId: envOrThrow('NOTIFY_SMS_TEMPLATE'),
    emailTemplateId: envOrThrow('NOTIFY_EMAIL_TEMPLATE'),
    healthCheckUrl: envOr('NOTIFY_HEALTH_CHECK_URL', 'https://api.notifications.service.gov.uk/_status'),
  },
  hmppsCookie: {
    name: envOr('HMPPS_COOKIE_NAME', 'hmpps-session-dev'),
    domain: envOr('HMPPS_COOKIE_DOMAIN', 'localhost'),
    expiryMinutes: envOr('WEB_SESSION_TIMEOUT_IN_MINUTES', 20),
  },
  port: envOrThrow('PORT'),
  domain: process.env.HMPPS_COOKIE_DOMAIN,
  sessionTimeout: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES,
  quantumAddresses: envOrThrow('QUANTUM_ADDRESS'),
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED,
  twoFactorAuthOn: process.env.TWO_FACT_AUTH_ON,
  https: true,
  regions: envOrThrow('REGIONS'),
})
