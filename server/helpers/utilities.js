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
  let type = 'Service temporarily unavailable. Please try again later. If this issue persists, please contact the Helpdesk on 0203 788 4636.'
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
      type =
        'Your email address stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk.'
    } else if (
      error.message.includes('phone_number Not enough digits') ||
      error.message.includes('phone_number Must not contain letters or symbols') ||
      error.message.includes('phone_number Too many digits')
    ) {
      type =
        'Your mobile number stored with Check My Diary is not valid. Please contact us via: checkmydiary@digital.justice.gov.uk.'
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

function getDaysInMonth(date){
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
} 

function configureCalendar(data, startDate) {

  if (data === null || data.shifts.length === 0) return { shifts: null }
  
  const convertedStartDate = new Date(startDate)
  
  const daysInMonth = new Date(convertedStartDate.getFullYear(), convertedStartDate.getMonth() + 1, 0).getDate()

  const pad = convertedStartDate.getDay()

  const noDay = { type: 'no-day' }
  const prePad = new Array(pad).fill(noDay)
  const postPadSize = Math.ceil((daysInMonth+pad)/7)*7
  const postPad = new Array(postPadSize - data.shifts.length - pad).fill(noDay)
  
  return { shifts: [...prePad, ...data.shifts, ...postPad] }          
}

function configureOvertimeCalendar(data, startDate) {

  if (data === null || data.shifts.length === 0) return { shifts: null }
  
  const convertedStartDateTime = new Date(startDate)
  const daysInMonth = getDaysInMonth(convertedStartDateTime)

  const newStartDate = new Date(convertedStartDateTime.getFullYear(), convertedStartDateTime.getMonth(), 1)

  // Insert blank days before the first date where necessary
  const pad = newStartDate.getDay()
  
  const newDataArray = []

  for(let x = 1; x <= daysInMonth; x+= 1 ){        
    newDataArray.push({
      type: 'no-day',
      startDateTime: new Date(newStartDate.getFullYear(), newStartDate.getMonth(), x),
    })      
  }      

  for(let x = 0; x <= data.shifts.length; x+= 1 ){      

    const shift = data.shifts[x]

    if (shift !== undefined){          
      newDataArray[new Date(shift.startDateTime).getDate()-1] = shift
    }        
  }            

  const noDay = { type: 'no-day' }
  const prePad = new Array(pad).fill(noDay)
  const postPadSize = Math.ceil((daysInMonth+pad)/7)*7
  const postPad = new Array(postPadSize - daysInMonth - pad).fill(noDay)
  
  return { shifts: [...prePad, ...newDataArray, ...postPad] }
    
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
  configureOvertimeCalendar,
}
