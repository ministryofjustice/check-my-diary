import config from '../config'
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
    return HmppsAuthClient.restClient(token).get({ path: '/api/user/me/mfa' }) as Promise<UserMfa>
  }
}
