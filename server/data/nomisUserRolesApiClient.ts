import { asSystem, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { UserDetail } from 'nomisUserRolesApiClient'
import logger from '../../logger'
import config from '../config'

export default class NomisUserRolesApiClient extends RestClient {
  constructor(authenticationClient?: AuthenticationClient) {
    super('NOMIS User Roles API Client', config.apis.nomisUserRolesApi, logger, authenticationClient)
  }

  public async findUsersByEmailAddress(email: string): Promise<Array<UserDetail>> {
    return this.get(
      {
        path: '/users/user',
        query: { email },
      },
      asSystem(),
    )
  }
}
