import Agent, { HttpsAgent } from 'agentkeepalive'
import superagent from 'superagent'

import config from '../../config'
import log from '../../log'

const oauthUrl = `${config.apis.hmppsAuth.url}/oauth/token`
const timeoutSpec = {
  response: config.apis.hmppsAuth.timeout.response,
  deadline: config.apis.hmppsAuth.timeout.deadline,
}
const keepaliveAgent = oauthUrl.startsWith('https')
  ? new HttpsAgent(config.apis.hmppsAuth.agent)
  : new Agent(config.apis.hmppsAuth.agent)

export default function signInService() {
  return {
    async getMyMfaSettings(token: string) {
      const data = await getMfa(token)
      return data.body
    },
  }
}

function getMfa(token: string) {
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
