const db = require('../database');

const getNotificationSettings = async ( quantumId ) => {    
 
        return db.select("emailaddress", "sms", "useemailaddress", "usesms").from('notifications')
                    .where('quantumid', '=', quantumId )        
                    .catch((err) => { throw err })
                    .finally(() => {
                        db.destroy();
                    });
};

module.exports = { getNotificationSettings };