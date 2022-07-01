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

  public async updateUserSessionExpiryAndLastLoginDateTime(quantumId: string, dateTime: Date) {
    this.db('UserAuthentication')
      .where({ QuantumId: quantumId.toLowerCase() })
      .update({ LastLoginDateTime: new Date(), SessionExpiryDateTime: dateTime })
      .catch((err) => {
        throw err
      })
  }

  public async updateTwoFactorAuthenticationHash(quantumId: string, hash: string) {
    this.db('UserAuthentication')
      .where({ QuantumId: quantumId.toLowerCase() })
      .update({ TwoFactorAuthenticationHash: hash })
      .catch((err) => {
        throw err
      })
  }

  public async getTwoFactorAuthenticationHash(quantumId: string) {
    return this.db
      .select('TwoFactorAuthenticationHash', 'ApiUrl')
      .from('UserAuthentication')
      .where('QuantumId', '=', quantumId.toLowerCase())
      .catch((err) => {
        throw err
      })
  }

  public async getSessionExpiryDateTime(quantumId: string) {
    return this.db
      .select('SessionExpiryDateTime')
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
