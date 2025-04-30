import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'

export interface UserMfa {
  backupVerified: boolean
  mobileVerified: boolean
  emailVerified: boolean
}

export default class HmppsAuthClient extends RestClient {
  constructor() {
    super('HMPPS Auth Client', config.apis.hmppsAuth, logger)
  }

  getMfa(token: string): Promise<UserMfa> {
    return this.get({ path: '/api/user/me/mfa' }, asUser(token)) as Promise<UserMfa>
  }
}
