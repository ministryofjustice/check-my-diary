import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  const envValue = process.env[name]
  if (envValue) return envValue

  if (fallback !== undefined && !(production && options.requireInProduction)) return fallback

  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true, noFallbackInProduction: false }

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: process.env.NO_HTTPS === 'true' ? false : production,
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
  entraId: {
    clientId: get('ENTRA_CLIENT_ID', 'clientId', requiredInProduction),
    clientSecret: get('ENTRA_CLIENT_SECRET', 'clientSecret', requiredInProduction),
    callbackUrl: get('ENTRA_CALLBACK_URL', 'http://localhost:3000/sign-in/callback', requiredInProduction),
    tenantId: get('ENTRA_TENANT_ID', '', requiredInProduction),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      healthPath: '/health/ping',
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 30000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 35000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      systemClientId: get('CHECK_MY_DIARY_POC_CLIENT_ID', 'check-my-diary-sso-prototype', requiredInProduction),
      systemClientSecret: get('CHECK_MY_DIARY_POC_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    cmdApi: {
      url: get('CMD_API_URL', 'http://localhost:8080', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('CMD_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('CMD_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('CMD_API_TIMEOUT_RESPONSE', 10000))),
    },
    nomisUserRolesApi: {
      url: get('NOMIS_USER_ROLES_API_URL', 'http://localhost:9092', requiredInProduction),
      healthPath: '/health/ping',
      timeout: {
        response: Number(get('NOMIS_USER_ROLES_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('NOMIS_USER_ROLES_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('NOMIS_USER_ROLES_API_TIMEOUT_RESPONSE', 10000))),
    },
  },
  app: {
    production,
    mailTo: process.env.MAIL_TO || 'feedback@digital.justice.gov.uk',
  },
  maintenance: {
    start: process.env.MAINTENANCE_START,
    end: process.env.MAINTENANCE_END,
  },
  ingressUrl: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  dpsHomeUrl: process.env.DPS_HOME_URL,
  environmentName: get('ENVIRONMENT_NAME', ''),
}
