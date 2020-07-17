require('dotenv').config()

const production = process.env.NODE_ENV === 'production'

const get = (name, fallback, { requireInProduction, noFallbackInProduction } = {}) => {
  if (process.env[name]) return process.env[name]

  if (production && noFallbackInProduction) return undefined

  if (fallback !== undefined && !(production && requireInProduction)) return fallback

  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

module.exports = {
  sessionSecret: get('SESSION_SECRET', '456456453rtretretete', requiredInProduction),
  db: {
    username: get('DATABASE_USER', 'check-my-diary'),
    password: get('DATABASE_PASSWORD', 'check-my-diary'),
    server: get('DATABASE_HOST', 'localhost'),
    database: get('DATABASE_NAME', 'check-my-diary'),
    sslEnabled: get('DB_SSL_ENABLED', 'false'),
  },
  nomis: {
    authUrl: get('API_AUTH_ENDPOINT_URL', get('NOMIS_AUTH_URL', 'https://gateway.t3.nomis-api.hmpps.dsd.io/auth')),
    authExternalUrl: get(
      'API_AUTH_EXTERNAL_ENDPOINT_URL',
      get('API_AUTH_ENDPOINT_URL', 'https://gateway.t3.nomis-api.hmpps.dsd.io/auth'),
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
    apiClientId: get('API_CLIENT_ID', 'my-diary', requiredInProduction),
    apiClientSecret: get('API_CLIENT_SECRET', 'kJwGCYAhn4AYRQF9', requiredInProduction),
  },
  app: {
    production,
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
    url: process.env.CHECK_MY_DIARY_URL || 'http://localhost:3000',
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  cmdApi: {
    url: get('CMD_API_URL', 'http://localhost:8080'),
  },
  hmppsCookie: {
    name: process.env.HMPPS_COOKIE_NAME || 'check-my-diary-dev',
    domain: process.env.HMPPS_COOKIE_DOMAIN || 'http://localhost:3000',
  },
  port: get('PORT', 3000, requiredInProduction),
  domain: process.env.HMPPS_COOKIE_DOMAIN,
  sessionTimeout: process.env.WEB_SESSION_TIMEOUT_IN_MINUTES,
  rejectUnauthorized: 0,
  twoFactorAuthOn: false,
  https: production,
  regions: get('REGIONS', '', requiredInProduction),
}
