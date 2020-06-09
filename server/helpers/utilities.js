const crypto = require('crypto')
const log = require('../../log')

function getStartMonth() {
  const now = new Date()
  return [now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')
}

function getEndDate(startDate) {
  const splitDate = startDate.split('-')
  return `${splitDate[0]}-${splitDate[1]}-${new Date(splitDate[0], splitDate[1], 0).getDate()}`
}

function get2faCode() {
  return Math.floor(Math.random() * 899999 + 100000)
}

function createTwoFactorAuthenticationHash(input) {
  return crypto.createHash('sha256').update(input.toString()).digest('base64')
}

function isNullOrEmpty(str) {
  if (
    typeof str === 'undefined' ||
    !str ||
    str.length === 0 ||
    str === '' ||
    !/[^\s]/.test(str) ||
    /^\s*$/.test(str) ||
    str.replace(/\s/g, '') === ''
  ) {
    return true
  }
  return false
}

function areDatesTheSame(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    // getMonth is 0-indexed
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function getAuthErrorDescription(error) {
  log.info(`login error description = ${error}`)
  log.info(
    `login response error description = ${
      error.response && error.response.data && error.response.data.error_description
    }`,
  )
  let type =
    'Service temporarily unavailable. Please try again later. If this issue persists, please contact the Helpdesk on 0203 788 4636.'
  if (error !== null && error.message !== '') {
    if (error.message.includes('No Sms or Email address returned for QuantumId')) {
      type =
        'You have not been setup on Check My Diary. Please contact us via: checkmydiary@digital.justice.gov.uk if you would like to be included.'
    } else if (error.message.includes('Sms or Email address null or empty for QuantumId')) {
      type =
        'You have not been setup with a email address or mobile number. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    } else if (error.message.includes('Sms or Email address both set to false for QuantumId')) {
      type =
        'Your email address or mobile number has not been enabled. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    } else if (error.message.includes('email_address Not a valid email address')) {
      type = '<p>We do not have a valid email address for you.</p><p>Please call the Service Desk on 0203 788 4636</p>'
    } else if (
      error.message.includes('phone_number Not enough digits') ||
      error.message.includes('phone_number Must not contain letters or symbols') ||
      error.message.includes('phone_number Too many digits')
    ) {
      type =
        '<p>We do not have a valid mobile phone number for you.</p><p>Please call the Service Desk on 0203 788 4636</p>'
    }
  }
  return type
}

function calculateMaintenanceDates(maintenanceStartDateTime, maintenanceEndDateTime) {
  let showMaintenancePage = false
  const currentDateTime = new Date()

  if (maintenanceEndDateTime !== null) {
    showMaintenancePage = !!(currentDateTime >= maintenanceStartDateTime && currentDateTime <= maintenanceEndDateTime)
  } else {
    showMaintenancePage = areDatesTheSame(currentDateTime, maintenanceStartDateTime)
  }

  return showMaintenancePage
}

function configureCalendar(data, startDate) {
  if (data === null || data.shifts.length === 0) return { shifts: null }

  const convertedStartDate = new Date(startDate)

  const daysInMonth = new Date(convertedStartDate.getFullYear(), convertedStartDate.getMonth() + 1, 0).getDate()

  const pad = convertedStartDate.getDay()

  const noDay = { type: 'no-day' }
  const prePad = new Array(pad).fill(noDay)
  const postPadSize = Math.ceil((daysInMonth + pad) / 7) * 7
  const postPad = new Array(postPadSize - data.shifts.length - pad).fill(noDay)

  return { shifts: [...prePad, ...data.shifts, ...postPad] }
}

function processOvertimeShifts(shiftsData, overtimeShiftsData) {
  if (shiftsData != null && shiftsData.shifts.length > 0) {
    if (overtimeShiftsData != null && overtimeShiftsData.shifts.length > 0) {
      overtimeShiftsData.shifts.forEach((overtimeShift) => {
        for (let i = 0; i < shiftsData.shifts.length; i += 1) {
          const shift = shiftsData.shifts[i]
          if (shift.type !== 'no-day') {
            if (overtimeShift.date === shift.date) {
              shift.overtime = true
            } else {
              shift.overtime = shift.overtime || false
            }
          }
        }
      })
    }
  }

  return shiftsData
}

module.exports = {
  getStartMonth,
  getEndDate,
  get2faCode,
  isNullOrEmpty,
  areDatesTheSame,
  getAuthErrorDescription,
  calculateMaintenanceDates,
  createTwoFactorAuthenticationHash,
  configureCalendar,
  processOvertimeShifts,
}
