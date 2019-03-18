const db = require('../database');

const getUserAuthenticationDetails = async ( quantumId ) => {    
 
        return db.select("EmailAddress", "Sms", "UseEmailAddress", "UseSms").from('UserAuthentication')
                    .where('QuantumId', '=', quantumId )        
                    .catch((err) => { throw err });
};

module.exports = { getUserAuthenticationDetails };