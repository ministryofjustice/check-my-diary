const db = require('../database');

const notificationService = () => {

    const getShiftNotifications = async ( quantumId ) => {    

        return db.select("DateTime", "Description", "ShiftDate", "LastModifiedDateTime", "Read").from('ShiftNotification')
                .where('QuantumId', '=', quantumId )
                .orderBy('LastModifiedDateTime', 'desc')
                .catch((err) => { throw err });
    }

    const updateShiftNotificationsToRead = async ( quantumId ) => {    
       
        db("ShiftNotification")
                .where({QuantumId : `${quantumId}`,
                Read : false})
                .update({ Read: true })
                .catch((err) => { throw err });
      }

    return {
        getShiftNotifications,
        updateShiftNotificationsToRead
    }
}

module.exports = {
    notificationService
}