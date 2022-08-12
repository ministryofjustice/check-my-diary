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

  public async updateSessionExpiryDateTime(quantumId: string) {
    this.db('UserAuthentication')
      .where({ QuantumId: quantumId.toLowerCase() })
      .update({ SessionExpiryDateTime: null })
      .catch((err) => {
        throw err
      })
  }
}
