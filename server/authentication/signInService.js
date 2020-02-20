const querystring = require('querystring')
const superagent = require('superagent')
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const log = require('../../log')
const config = require('../../config')
const fiveMinutesBefore = require('../utils/fiveMinutesBefore')

const oauthUrl = `${config.nomis.authUrl}/oauth/token`
const timeoutSpec = {
  response: config.nomis.timeout.response,
  deadline: config.nomis.timeout.deadline,
}

const agentOptions = {
  maxSockets: config.nomis.agent.maxSockets,
  maxFreeSockets: config.nomis.agent.maxFreeSockets,
  freeSocketTimeout: config.nomis.agent.freeSocketTimeout,
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
  const clientId = config.nomis.apiClientId
  const clientSecret = config.nomis.apiClientSecret

  return superagent
    .post(`${config.nomis.authUrl}/oauth/token`)
    .auth(clientId, clientSecret)
    .set('content-type', 'application/x-www-form-urlencoded')
    .agent(keepaliveAgent)
    .retry(2, (err, res) => {
      if (err) log.info(`Retry handler found API error with ${err.code} ${err.message}`)
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
  }
}

module.exports = signInService
