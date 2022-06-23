const querystring = require('querystring')
const superagent = require('superagent')
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const log = require('../../log')
const config = require('../../config')
const fiveMinutesBefore = require('../utils/fiveMinutesBefore')

const oauthUrl = `${config.apis.hmppsAuth.url}/oauth/token`
const timeoutSpec = {
  response: config.apis.hmppsAuth.timeout.response,
  deadline: config.apis.hmppsAuth.timeout.deadline,
}

const agentOptions = {
  timeout: config.apis.hmppsAuth.agent.timeout,
  freeSocketTimeout: config.apis.hmppsAuth.agent.freeSocketTimeout,
}
const keepaliveAgent = oauthUrl.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)

async function oauthTokenRequest(oauthRequest) {
  const oauthResult = await getOauthToken(oauthRequest)
  log.info(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`)

  const token = oauthResult.body.access_token
  const refreshToken = oauthResult.body.refresh_token
  const expiresIn = oauthResult.body.expires_in

  return { token, refreshToken, expiresIn }
}

function getOauthToken(requestSpec) {
  const oauthRequest = querystring.stringify(requestSpec)
  const clientId = config.apis.hmppsAuth.apiClientId
  const clientSecret = config.apis.hmppsAuth.apiClientSecret

  return superagent
    .post(`${config.apis.hmppsAuth.url}/oauth/token`)
    .auth(clientId, clientSecret)
    .set('content-type', 'application/x-www-form-urlencoded')
    .agent(keepaliveAgent)
    .retry(2, (err) => {
      if (err) log.info(`getOauthToken: Retry handler found API error with ${err.code} ${err.message}`)
      return undefined // retry handler only for logging retries, not to influence retry logic
    })
    .send(oauthRequest)
    .timeout(timeoutSpec)
}

function signInService() {
  return {
    getUser(token, refreshToken, expiresIn, username) {
      log.info(`User profile for: ${username}`)

      return {
        token,
        refreshToken,
        refreshTime: fiveMinutesBefore(expiresIn),
        username,
      }
    },

    async getRefreshedToken(user) {
      log.info(`Refreshing token for : ${user.username}`)

      const oauthRequest = { grant_type: 'refresh_token', refresh_token: user.refreshToken }

      const { token, refreshToken, expiresIn } = await oauthTokenRequest(oauthRequest)
      const refreshTime = fiveMinutesBefore(expiresIn)
      return { token, refreshToken, refreshTime }
    },

    async getMyMfaSettings(token) {
      const data = await getMfa(token)
      return data.body
    },
  }
}

function getMfa(token) {
  return superagent
    .get(`${config.apis.hmppsAuth.url}/api/user/me/mfa`)
    .set('content-type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .agent(keepaliveAgent)
    .retry(2, (err) => {
      if (err) log.info(`getMfa: Retry handler found API error with ${err.code} ${err.message}`)
      return undefined // retry handler only for logging retries, not to influence retry logic
    })
    .timeout(timeoutSpec)
}

module.exports = signInService
