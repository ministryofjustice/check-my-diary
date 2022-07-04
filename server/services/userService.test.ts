import UserService from './userService'
import HmppsAuthClient, { UserMfa } from '../data/hmppsAuthClient'

jest.mock('../data/hmppsAuthClient')

const token = 'some token'

describe('User service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient() as jest.Mocked<HmppsAuthClient>
      userService = new UserService(hmppsAuthClient)
    })
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getMfa.mockResolvedValue({
        backupVerified: true,
        mobileVerified: false,
        emailVerified: true,
      } as UserMfa)

      const result = await userService.getUserMfa(token)

      expect(result.backupVerified).toEqual(true)
    })
    it('Propagates error', async () => {
      hmppsAuthClient.getMfa.mockRejectedValue(new Error('some error'))

      await expect(userService.getUserMfa(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
