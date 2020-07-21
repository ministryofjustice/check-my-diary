const db = require('../database')

const DEPRECATEnotificationService = {
  // this is only used to count the number of notifications in calendar.ejs
  async getShiftNotifications(quantumId) {
    return db
      .select('quantum_id', 'shift_modified')
      .from('shift_notification')
      .where('quantum_id', '=', quantumId.toLowerCase())
      .catch((err) => {
        throw err
      })
  },

  getUserNotificationSettings(quantumId) {
    return db
      .select('EmailAddress', 'Sms', 'UseEmailAddress', 'UseSms')
      .from('UserNotificationSetting')
      .where('QuantumId', '=', quantumId.toLowerCase())
      .catch((err) => {
        throw err
      })
  },

  async updateUserNotificationSettings(quantumId, emailAddress, sms, useEmailAddress, useSms) {
    const userNotificationSetting = await DEPRECATEnotificationService.getUserNotificationSettings(quantumId)

    if (userNotificationSetting !== null && userNotificationSetting.length > 0) {
      db('UserNotificationSetting')
        .where({ QuantumId: quantumId.toLowerCase() })
        .update({ EmailAddress: emailAddress, Sms: sms, UseEmailAddress: useEmailAddress, UseSms: useSms })
        .catch((err) => {
          throw err
        })
    } else {
      db('UserNotificationSetting')
        .insert({
          QuantumId: quantumId.toLowerCase(),
          EmailAddress: emailAddress,
          Sms: sms,
          UseEmailAddress: useEmailAddress,
          UseSms: useSms,
        })
        .catch((err) => {
          throw err
        })
    }
  },
}

module.exports = DEPRECATEnotificationService
