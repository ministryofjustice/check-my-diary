const knex = require('knex')

const db = require('../database')

const DEPRECATEnotificationService = {
  // this is only used to count the number of notifications in calendar.ejs
  async getShiftNotifications(quantumId) {
    return db
      .select('quantum_id', 'last_modified')
      .from('shift_notification')
      .where('quantum_id', '=', quantumId.toLowerCase())
      .union(
        db
          .select('quantum_id', 'last_modified')
          .from('shift_task_notification')
          .where('quantum_id', '=', quantumId.toLowerCase()),
      )
      .catch((err) => {
        throw err
      })
  },

  getShiftNotificationsPaged(quantumId, offset, perPage) {
    return db
      .select(knex.raw(`description AS "Description", last_modified AS "LastModifiedDateTime"`))
      .from('shift_notification')
      .where('quantum_id', '=', quantumId.toLowerCase())
      .union(
        db
          .select(knex.raw(`description AS "Description", last_modified AS "LastModifiedDateTime"`))
          .from('shift_task_notification')
          .where('quantum_id', '=', quantumId.toLowerCase()),
      )
      .offset(offset)
      .limit(perPage)
      .orderBy('LastModifiedDateTime', 'DESC')
      .catch((err) => {
        throw err
      })
  },

  updateShiftNotificationsToRead(quantumId) {
    db('shift_notification')
      .where({ quantum_id: `${quantumId.toLowerCase()}`, processed: false })
      .update({ processed: true })
      .catch((err) => {
        throw err
      })
  },

  updateShiftTaskNotificationsToRead(quantumId) {
    db('shift_task_notification')
      .where({ quantum_id: `${quantumId.toLowerCase()}`, processed: false })
      .update({ processed: true })
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
