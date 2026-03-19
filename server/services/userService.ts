import type { UserDetail } from 'nomisUserRolesApiClient'
import { Profile } from 'passport'
import NomisUserRolesApiClient from '../data/nomisUserRolesApiClient'
import { PrisonUser } from '../interfaces/hmppsUser'
import { convertToTitleCase } from '../utils/utils'

export default class UserService {
  constructor(private readonly nomisUserRolesApiClient: NomisUserRolesApiClient) {}

  async getActiveGeneralUsersMatchingMicrosoftProfile(profile: Profile): Promise<PrisonUser[]> {
    if (!profile?.emails || profile.emails.length === 0) {
      return []
    }

    const emailAddress = profile.emails[0].value

    return this.nomisUserRolesApiClient
      .findUsersByEmailAddress(emailAddress)
      .then(users =>
        users.filter(user => user.active && user.accountNonLocked && user.credentialsNonExpired && !user.admin),
      )
      .then(users => users.map(user => this.toPrisonUser(user)))
  }

  toPrisonUser(user: UserDetail): PrisonUser {
    const roles = user.dpsRoleCodes?.map((role: string) => `ROLE_${role}`) || []
    roles.push('ROLE_PRISON')
    return {
      authSource: 'nomis',
      username: user.username,
      name: `${user.firstName} ${user.lastName}`,
      displayName: convertToTitleCase(`${user.firstName} ${user.lastName}`),
      userRoles: roles,
    } as PrisonUser
  }
}
