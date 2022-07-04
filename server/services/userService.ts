import HmppsAuthClient, { UserMfa } from '../data/hmppsAuthClient'

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUserMfa(token: string): Promise<UserMfa> {
    return this.hmppsAuthClient.getMfa(token)
  }
}
