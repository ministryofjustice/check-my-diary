const db = require('../database')

const DEPRECATEnotificationService = () => {
  const getShiftNotifications = async (quantumId) => {
    return db
      .select('DATE_TIME', 'DESCRIPTION', 'LAST_MODIFIED_DATE_TIME', 'LAST_MODIFIED_DATE_TIME_IN_SECONDS', 'READ')
      .from('SHIFT_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .union(
        db
          .select('DATE_TIME', 'DESCRIPTION', 'LAST_MODIFIED_DATE_TIME', 'LAST_MODIFIED_DATE_TIME_IN_SECONDS', 'READ')
          .from('SHIFT_TASK_NOTIFICATION')
          .where('QUANTUM_ID', '=', quantumId.toLowerCase()),
      )
      .orderBy('LAST_MODIFIED_DATE_TIME_IN_SECONDS', 'desc')
      .catch((err) => {
        throw err
      })
  }

  const getShiftNotificationsPaged = (quantumId, offset, perPage) => {
    return db
      .select('DATE_TIME', 'DESCRIPTION', 'LAST_MODIFIED_DATE_TIME', 'LAST_MODIFIED_DATE_TIME_IN_SECONDS', 'READ')
      .from('SHIFT_TASK_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .union(
        db
          .select('DATE_TIME', 'DESCRIPTION', 'LAST_MODIFIED_DATE_TIME', 'LAST_MODIFIED_DATE_TIME_IN_SECONDS', 'Read')
          .from('SHIFT_TASK_NOTIFICATION')
          .where('QUANTUM_ID', '=', quantumId.toLowerCase()),
      )
      .offset(offset)
      .limit(perPage)
      .orderBy('LAST_MODIFIED_DATE_TIME_IN_SECONDS', 'desc')
      .catch((err) => {
        throw err
      })
  }

  const getShiftNotificationsCount = (quantumId) => {
    return db
      .count('QUANTUM_ID')
      .from('SHIFT_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .first()
      .catch((err) => {
        throw err
      })
  }

  const getShiftTaskNotificationsCount = (quantumId) => {
    return db
      .count('QUANTUM_ID')
      .from('SHIFT_TASK_NOTIFICATION')
      .where('QUANTUM_ID', '=', quantumId.toLowerCase())
      .first()
      .catch((err) => {
        throw err
      })
  }

  const updateShiftNotificationsToRead = async (quantumId) => {
    db('SHIFT_NOTIFICATION')
      .where({ QUANTUM_ID: `${quantumId.toLowerCase()}`, READ: false })
      .update({ READ: true })
      .catch((err) => {
        throw err
      })
  }

  const updateShiftTaskNotificationsToRead = async (quantumId) => {
    db('SHIFT_TASK_NOTIFICATION')
      .where({ QUANTUM_ID: `${quantumId.toLowerCase()}`, READ: false })
      .update({ READ: true })
      .catch((err) => {
        throw err
      })
  }

  const getUserNotificationSettings = async (quantumId) => {
    return db
      .select('EmailAddress', 'Sms', 'UseEmailAddress', 'UseSms')
      .from('UserNotificationSetting')
      .where('QuantumId', '=', quantumId.toLowerCase())
      .catch((err) => {
        throw err
      })
  }

  const updateUserNotificationSettings = async (quantumId, emailAddress, sms, useEmailAddress, useSms) => {
    const userNotificationSetting = await getUserNotificationSettings(quantumId)

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
  }

  return {
    getShiftNotifications,
    getShiftNotificationsPaged,
    getShiftNotificationsCount,
    getShiftTaskNotificationsCount,
    updateShiftNotificationsToRead,
    updateShiftTaskNotificationsToRead,
    getUserNotificationSettings,
    updateUserNotificationSettings,
  }
}

module.exports = DEPRECATEnotificationService
