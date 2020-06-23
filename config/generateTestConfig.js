module.exports = () => ({
  sessionSecret: 'app-insecure-default-session',
  db: {
    username: 'check-my-diary',
    password: 'check-my-diary',
    server: 'localhost',
    database: 'check-my-diary',
    sslEnabled: 'DB_SSL_ENABLED',
  },
  nomis: {
    authUrl: 'http://localhost:9191/auth',
    authExternalUrl: 'http://localhost:9191/auth',
    timeout: {
      response: 30000,
      deadline: 35000,
    },
    agent: {
      maxSockets: 100,
      maxFreeSockets: 10,
      freeSocketTimeout: 30000,
    },
    apiClientId: 'my-diary',
    apiClientSecret: 'clientsecret',
  },
  app: {
    production: false,
    mailTo: 'feedback@digital.justice.gov.uk',
    url: `http://localhost:3005`,
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  notify: {
    url: 'http://localhost:9191',
    clientKey: 'some_invalid_key',
    smsTemplateId: 'not_sms',
    emailTemplateId: 'not_email',
    healthCheckUrl: 'https://api.notifications.service.gov.uk/_status',
  },
  hmppsCookie: {
    name: 'hmpps-session-dev',
    domain: 'localhost',
    expiryMinutes: 20,
  },
  port: 3005,
  // domain: NO VALUE NEEDED,
  // sessionTimeout: NO VALUE NEEDED,
  quantumAddresses: '127.0.0.1',
  // rejectUnauthorized: NO VALUE NEEDED,
  // twoFactorAuthOn: NO VALUE NEEDED,
  https: false,
  regions: '',
})
