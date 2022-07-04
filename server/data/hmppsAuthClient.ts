import logger from '../../log'
import config from '../../config'
import RestClient from './restClient'

export interface UserMfa {
  backupVerified: boolean
  mobileVerified: boolean
  emailVerified: boolean
}

export default class HmppsAuthClient {
  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  getMfa(token: string): Promise<UserMfa> {
    logger.info(`Getting mfa details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).get({ path: '/api/user/me/mfa' }) as Promise<UserMfa>
  }
}
