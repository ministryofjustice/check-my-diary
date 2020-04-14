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

const updateUserSessionExpiryAndLastLoginDateTime = async ( quantumId, dateTime ) => {
 
        db('UserAuthentication')
                .where({ QuantumId: quantumId.toLowerCase() })
                .update({ LastLoginDateTime: new Date().toLocaleString(),
                        SessionExpiryDateTime: dateTime })
                .catch((err) => { throw err })
}

const updateTwoFactorAuthenticationHash = async ( quantumId, hash ) => {
 
        db('UserAuthentication')
                .where({ QuantumId: quantumId.toLowerCase() })
                .update({ TwoFactorAuthenticationHash: hash })
                .catch((err) => { throw err })
}

const getTwoFactorAuthenticationHash = async ( quantumId ) => {    
 
        return db.select('TwoFactorAuthenticationHash', 'ApiUrl').from('UserAuthentication')
                    .where('QuantumId', '=', quantumId.toLowerCase() )        
                    .catch((err) => { throw err })                                        
}

const getSessionExpiryDateTime = async ( quantumId ) => {    
 
        return db.select('SessionExpiryDateTime').from('UserAuthentication')
                    .where('QuantumId', '=', quantumId.toLowerCase() )        
                    .catch((err) => { throw err })                                        
}

const updateSessionExpiryDateTime = async ( quantumId ) => {
 
        db('UserAuthentication')
                .where({ QuantumId: quantumId.toLowerCase() })
                .update({ SessionExpiryDateTime: null })
                .catch((err) => { throw err })
}

module.exports = { 
        getUserAuthenticationDetails, 
        updateUserSessionExpiryAndLastLoginDateTime, 
        updateTwoFactorAuthenticationHash,
        getTwoFactorAuthenticationHash, 
        getSessionExpiryDateTime, 
        updateSessionExpiryDateTime }