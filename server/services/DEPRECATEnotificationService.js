const knex = require('knex')

const db = require('../database')

const DEPRECATEnotificationService = {
  async getShiftNotifications(quantumId) {
    return db
      .select(
        knex.raw(
          `"DATE_TIME" as "Datetime", "DESCRIPTION" as "Description", "LAST_MODIFIED_DATE_TIME" as "LastModifiedDateTime", "LAST_MODIFIED_DATE_TIME_IN_SECONDS" as "LastModifiedDateTimeInSeconds", "READ" as "Read"`,
        ),
      )
      .from('SHIFT_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .union(
        db
          .select(
            knex.raw(
              `"DATE_TIME" as "Datetime", "DESCRIPTION" as "Description", "LAST_MODIFIED_DATE_TIME" as "LastModifiedDateTime", "LAST_MODIFIED_DATE_TIME_IN_SECONDS" as "LastModifiedDateTimeInSeconds", "READ" as "Read"`,
            ),
          )
          .from('SHIFT_TASK_NOTIFICATION')
          .where('QUANTUM_ID', '=', quantumId.toLowerCase()),
      )
      .orderBy('LastModifiedDateTimeInSeconds', 'desc')
      .catch((err) => {
        throw err
      })
  },

  getShiftNotificationsPaged(quantumId, offset, perPage) {
    return db
      .select(
        knex.raw(
          `"DATE_TIME" as "Datetime", "DESCRIPTION" as "Description", "LAST_MODIFIED_DATE_TIME" as "LastModifiedDateTime", "LAST_MODIFIED_DATE_TIME_IN_SECONDS" as "LastModifiedDateTimeInSeconds", "READ" as "Read"`,
        ),
      )
      .from('SHIFT_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .union(
        db
          .select(
            knex.raw(
              `"DATE_TIME" as "Datetime", "DESCRIPTION" as "Description", "LAST_MODIFIED_DATE_TIME" as "LastModifiedDateTime", "LAST_MODIFIED_DATE_TIME_IN_SECONDS" as "LastModifiedDateTimeInSeconds", "READ" as "Read"`,
            ),
          )
          .from('SHIFT_TASK_NOTIFICATION')
          .where('QUANTUM_ID', '=', quantumId.toLowerCase()),
      )
      .offset(offset)
      .limit(perPage)
      .orderBy('LastModifiedDateTimeInSeconds', 'desc')
      .catch((err) => {
        throw err
      })
  },

  getShiftNotificationsCount(quantumId) {
    return db
      .count('QUANTUM_ID')
      .from('SHIFT_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .first()
      .catch((err) => {
        throw err
      })
  },

  getShiftTaskNotificationsCount(quantumId) {
    return db
      .count('QUANTUM_ID')
      .from('SHIFT_TASK_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .first()
      .catch((err) => {
        throw err
      })
  },

  updateShiftNotificationsToRead(quantumId) {
    db('SHIFT_NOTIFICATION')
      .where({ QUANTUM_ID: `${quantumId.toLowerCase()}`, READ: false })
      .update({ READ: true })
      .catch((err) => {
        throw err
      })
  },

  updateShiftTaskNotificationsToRead(quantumId) {
    db('SHIFT_TASK_NOTIFICATION')
      .where({ QUANTUM_ID: `${quantumId.toLowerCase()}`, READ: false })
      .update({ READ: true })
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
