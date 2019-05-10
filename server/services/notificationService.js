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

    const getUserNotificationSettings = async ( quantumId ) => {    

        return db.select("EmailAddress", "Sms", "UseEmailAddress", "UseSms").from('UserNotificationSetting')
                .where('QuantumId', '=', quantumId )                
                .catch((err) => { throw err });
    }

    const updateUserNotificationSettings = async ( quantumId, emailAddress, sms, useEmailAddress, useSms ) => {    

        const userNotificationSetting = await getUserNotificationSettings(quantumId);

        if (userNotificationSetting !== null && userNotificationSetting.length > 0) {

            db("UserNotificationSetting")
            .where({QuantumId : quantumId})
            .update({ EmailAddress: emailAddress,
                    Sms : sms,
                    UseEmailAddress : useEmailAddress,
                    UseSms : useSms})
            .catch((err) => { throw err });
        } else {
            db("UserNotificationSetting").insert({ QuantumId: quantumId, EmailAddress : emailAddress, 
                                      Sms : sms, UseEmailAddress : useEmailAddress, 
                                      UseSms : useSms})
                .catch((err) => { throw err });
        }
    }

    return {
        getShiftNotifications,
        updateShiftNotificationsToRead,
        getUserNotificationSettings,
        updateUserNotificationSettings
    }
}

module.exports = {
    notificationService
}