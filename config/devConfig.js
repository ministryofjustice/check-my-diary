const { envOr, envListOr } = require('./utils')

module.exports = () => ({
  sessionSecret: envOr('SESSION_SECRET', 'app-insecure-default-session'),
  db: {
    username: envOr('DATABASE_USER', 'check-my-diary'),
    password: envOr('DATABASE_PASSWORD', 'check-my-diary'),
    server: envOr('DATABASE_HOST', 'localhost'),
    database: envOr('DATABASE_NAME', 'check-my-diary'),
    sslEnabled: envOr('DB_SSL_ENABLED', 'false'),
  },
  nomis: {
    authUrl: envListOr(['API_AUTH_ENDPOINT_URL', 'NOMIS_AUTH_URL'], 'http://localhost:9191/auth'),
    authExternalUrl: envListOr(
      ['API_AUTH_EXTERNAL_ENDPOINT_URL', 'API_AUTH_ENDPOINT_URL'],
      'http://localhost:9191/auth',
    ),
    timeout: {
      response: 30000,
      deadline: 35000,
    },
    agent: {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    },
    apiClientId: envOr('API_CLIENT_ID', 'my-diary'),
    apiClientSecret: envOr('API_CLIENT_SECRET', 'my-diary'),
  },
  app: {
    production: false,
    mailTo: envOr('MAIL_TO', 'feedback@digital.justice.gov.uk'),
    url: envOr('CHECK_MY_DIARY_URL', `http://localhost:${process.env.PORT || 3005}`),
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  notify: {
    url: envOr('NOTIFY_URL', 'http://localhost:9191'),
    clientKey: envOr('NOTIFY_CLIENT_KEY', 'some_invalid_key'),
    smsTemplateId: envOr('NOTIFY_SMS_TEMPLATE', 'not_sms'),
    emailTemplateId: envOr('NOTIFY_EMAIL_TEMPLATE', 'not_email'),
    healthCheckUrl: envOr('NOTIFY_HEALTH_CHECK_URL', 'https://api.notifications.service.gov.uk/_status'),
  },
  hmppsCookie: {
    name: envOr('HMPPS_COOKIE_NAME', 'hmpps-session-dev'),
    domain: envOr('HMPPS_COOKIE_DOMAIN', 'localhost'),
    expiryMinutes: envOr('WEB_SESSION_TIMEOUT_IN_MINUTES', 20),
  },
  port: envOr('PORT', 3000),
  domain: process.env.HMPPS_COOKIE_DOMAIN,
  sessionTimeout: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES,
  quantumAddresses: envOr('QUANTUM_ADDRESS', '127.0.0.1'),
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED,
  twoFactorAuthOn: process.env.TWO_FACT_AUTH_ON,
  https: true,
  regions: envOr('REGIONS', ''),
})
