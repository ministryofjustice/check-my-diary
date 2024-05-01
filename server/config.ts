const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  const envValue = process.env[name]
  if (envValue) return envValue

  if (fallback !== undefined && !(production && options.requireInProduction)) return fallback

  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true, noFallbackInProduction: false }

export class AgentConfig {
  timeout: number

  freeSocketTimeout: number

  constructor(timeout = 10000, freeSocketTimeout = 30000) {
    this.timeout = timeout
    this.freeSocketTimeout = freeSocketTimeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    // sets maximum time to wait for the first byte to arrive from the server, but it does not limit how long the
    // entire download can take.
    response: number
    // sets a deadline for the entire request (including all uploads, redirects, server processing time) to complete.
    // If the response isn't fully downloaded within that time, the request will be aborted.
    deadline: number
  }
  agent: AgentConfig
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: '1h',
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
    enabled: get('REDIS_ENABLED', 'false', requiredInProduction) === 'true',
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 35000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'my-diary', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  app: {
    production,
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
    url: process.env.CHECK_MY_DIARY_URL || `http://localhost:${process.env.PORT || 3000}`,
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  cmdApi: {
    url: get('CMD_API_URL', 'http://localhost:9091'),
  },
  domain: process.env.HMPPS_COOKIE_DOMAIN,
  dpsHomeUrl: process.env.DPS_HOME_URL,
  environmentName: get('ENVIRONMENT_NAME', ''),
}
