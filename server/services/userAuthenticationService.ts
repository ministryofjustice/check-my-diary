import knex from '../database'

export default class UserAuthenticationService {
  db = knex()

  public async getUserAuthenticationDetails(quantumId: string) {
    return this.db
      .select('EmailAddress', 'Sms', 'UseEmailAddress', 'UseSms', 'ApiUrl', 'TwoFactorAuthenticationHash')
      .from('UserAuthentication')
      .where('QuantumId', '=', quantumId.toLowerCase())
      .catch((err) => {
        throw err
      })
  }
}
