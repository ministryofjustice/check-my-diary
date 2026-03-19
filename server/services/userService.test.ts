import type { UserDetail } from 'nomisUserRolesApiClient'
import { Profile } from 'passport'
import UserService from './userService'
import NomisUserRolesApiClient from '../data/nomisUserRolesApiClient'

jest.mock('../data/nomisUserRolesApiClient')

const testEmail = 'random@justice.gov.uk'
const testProfile = { emails: [{ value: testEmail }] } as Profile

describe('User service', () => {
  let nomisUserRolesApiClient: jest.Mocked<NomisUserRolesApiClient>
  let userService: UserService

  describe('getActiveGeneralUsersMatchingMicrosoftProfile', () => {
    beforeEach(() => {
      nomisUserRolesApiClient = new NomisUserRolesApiClient() as jest.Mocked<NomisUserRolesApiClient>
      userService = new UserService(nomisUserRolesApiClient)
    })

    it('Retrieves active, unlocked general user matching Entra email address', async () => {
      nomisUserRolesApiClient.findUsersByEmailAddress.mockResolvedValue([
        {
          username: 'test-general',
          primaryEmail: testEmail,
          active: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
          admin: false,
          accountType: 'GENERAL',
          firstName: 'test-general',
          lastName: 'user',
          dpsRoleCodes: ['SOME_ROLE'],
        },
        {
          username: 'test-admin',
          primaryEmail: testEmail,
          active: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
          admin: true,
          accountType: 'ADMIN',
          firstName: 'test-admin',
          lastName: 'user',
          dpsRoleCodes: ['SOME_OTHER_ROLE'],
        },
        {
          username: 'test-general-locked',
          primaryEmail: testEmail,
          active: true,
          accountNonLocked: false,
          credentialsNonExpired: true,
          admin: false,
          accountType: 'GENERAL',
          firstName: 'test-general-locked',
          lastName: 'user',
          dpsRoleCodes: ['SOME_OTHER_ROLE'],
        },
      ] as UserDetail[])

      const result = await userService.getActiveGeneralUsersMatchingMicrosoftProfile(testProfile)

      expect(nomisUserRolesApiClient.findUsersByEmailAddress).toHaveBeenCalledWith(testEmail)
      expect(result.length).toEqual(1)
      expect(result[0].username).toEqual('test-general')
      expect(result[0].displayName).toEqual('Test-General User')
      expect(result[0].userRoles).toEqual(['ROLE_SOME_ROLE', 'ROLE_PRISON'])
    })
  })
})
