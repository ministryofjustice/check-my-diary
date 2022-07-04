const superagent = require('superagent')
const Agent = require('agentkeepalive')
const { HttpsAgent } = require('agentkeepalive')
const log = require('../../log')
const config = require('../../config')

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

function signInService() {
  return {
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
