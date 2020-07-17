const db = require('../database')

const getUserAuthenticationDetails = async (quantumId) => {
  return db
    .select('EmailAddress', 'Sms', 'UseEmailAddress', 'UseSms', 'ApiUrl', 'TwoFactorAuthenticationHash')
    .from('UserAuthentication')
    .where('QuantumId', '=', quantumId.toLowerCase())
    .catch((err) => {
      throw err
    })
}

module.exports = {
  getUserAuthenticationDetails,
}
