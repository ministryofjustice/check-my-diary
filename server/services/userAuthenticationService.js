const db = require('../database')

const getUserAuthenticationDetails = async ( quantumId ) => {    
 
        return db.select("EmailAddress", "Sms", "UseEmailAddress", "UseSms", "ApiUrl").from('UserAuthentication')
                    .where('QuantumId', '=', quantumId.toLowerCase() )        
                    .catch((err) => { throw err })
}

const updateUserLastLoginDateTime = async ( quantumId ) => {    
 
        db("UserAuthentication")
                .where({ QuantumId: quantumId.toLowerCase() })
                .update({ LastLoginDateTime: new Date().toLocaleString() })                               
                .catch((err) => { throw err })
}

module.exports = { getUserAuthenticationDetails, updateUserLastLoginDateTime }