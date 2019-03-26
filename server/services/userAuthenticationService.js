const db = require('../database');

const getUserAuthenticationDetails = async ( quantumId ) => {    
 
        return db.select("EmailAddress", "Sms", "UseEmailAddress", "UseSms").from('UserAuthentication')
                    .where('QuantumId', '=', quantumId )        
                    .catch((err) => { throw err });
};

const updateUserLastLoginDateTime = async ( quantumId ) => {    
 
        db("UserAuthentication")
                .where({ QuantumId: quantumId })
                .update({ LastLoginDateTime: new Date().toLocaleString() })                               
                .catch((err) => { throw err });
};

module.exports = { getUserAuthenticationDetails, updateUserLastLoginDateTime };