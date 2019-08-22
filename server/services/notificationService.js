const db = require('../database');

const notificationService = () => {

    const getShiftNotifications = async ( quantumId ) => {    

        return db.select("DateTime", "Description", "LastModifiedDateTime", "LastModifiedDateTimeInSeconds", "Read").from('ShiftNotification')
                .where('QuantumId', '=', quantumId.toLowerCase() ).union( 
                db.select("DateTime", "Description", "LastModifiedDateTime", "LastModifiedDateTimeInSeconds", "Read").from('ShiftTaskNotification')
                .where('QuantumId', '=', quantumId.toLowerCase() ))
                .orderBy('LastModifiedDateTimeInSeconds', 'desc')
                .catch((err) => { throw err });
    }

    const getShiftNotificationsPaged = ( quantumId, offset, perPage ) => {    

        return db.select("DateTime", "Description", "LastModifiedDateTime", "LastModifiedDateTimeInSeconds", "Read")
                .from('ShiftNotification')
                .where('QuantumId', '=', quantumId.toLowerCase() ).union(
                db.select("DateTime", "Description", "LastModifiedDateTime", "LastModifiedDateTimeInSeconds", "Read")
                .from('ShiftTaskNotification')
                .where('QuantumId', '=', quantumId.toLowerCase() )).offset(offset).limit(perPage)
                .orderBy('LastModifiedDateTimeInSeconds', 'desc')
                .catch((err) => { throw err });    
    }

    const getShiftNotificationsCount = ( quantumId ) => {    

        return db.count("QuantumId").from('ShiftNotification')
        .where('QuantumId', '=', quantumId.toLowerCase() ).first()
                .catch((err) => { throw err });
    }

    const getShiftTaskNotificationsCount = ( quantumId ) => {    

        return db.count("QuantumId").from('ShiftTaskNotification')
        .where('QuantumId', '=', quantumId.toLowerCase() ).first()
                .catch((err) => { throw err });
    }

    const updateShiftNotificationsToRead = async ( quantumId ) => {    
       
        db("ShiftNotification")
                .where({QuantumId : `${quantumId.toLowerCase()}`,
                Read : false})
                .update({ Read: true })
                .catch((err) => { throw err });
    }

    const updateShiftTaskNotificationsToRead = async ( quantumId ) => {    
       
        db("ShiftTaskNotification")
                .where({QuantumId : `${quantumId.toLowerCase()}`,
                Read : false})
                .update({ Read: true })
                .catch((err) => { throw err });
    }

    const getUserNotificationSettings = async ( quantumId ) => {    

        return db.select("EmailAddress", "Sms", "UseEmailAddress", "UseSms").from('UserNotificationSetting')
                .where('QuantumId', '=', quantumId.toLowerCase() )                
                .catch((err) => { throw err });
    }

    const updateUserNotificationSettings = async ( quantumId, emailAddress, sms, useEmailAddress, useSms ) => {    

        const userNotificationSetting = await getUserNotificationSettings(quantumId);

        if (userNotificationSetting !== null && userNotificationSetting.length > 0) {

            db("UserNotificationSetting")
            .where({QuantumId : quantumId.toLowerCase()})
            .update({ EmailAddress: emailAddress,
                    Sms : sms,
                    UseEmailAddress : useEmailAddress,
                    UseSms : useSms})
            .catch((err) => { throw err });
        } else {
            db("UserNotificationSetting").insert({ QuantumId: quantumId.toLowerCase(), EmailAddress : emailAddress, 
                                      Sms : sms, UseEmailAddress : useEmailAddress, 
                                      UseSms : useSms})
                .catch((err) => { throw err });
        }
    }

    return {
        getShiftNotifications,
        getShiftNotificationsPaged,
        getShiftNotificationsCount,
        getShiftTaskNotificationsCount,        
        updateShiftNotificationsToRead,
        updateShiftTaskNotificationsToRead,
        getUserNotificationSettings,
        updateUserNotificationSettings
    }
}

module.exports = {
    notificationService
}