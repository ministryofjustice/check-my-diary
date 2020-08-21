const moment = require('moment')
const crypto = require('crypto')
const jwtDecode = require('jwt-decode')

const log = require('../../log')
const { GENERAL_ERROR } = require('./errorConstants')

function getStartMonth() {
  return moment().startOf('month').format('YYYY-MM-DD')
}

function getEndDate(startDate) {
  return moment(startDate).endOf('month').format('YYYY-MM-DD')
}

function get2faCode() {
  return Math.floor(Math.random() * 899999 + 100000)
}

function createTwoFactorAuthenticationHash(input) {
  return crypto.createHash('sha256').update(input.toString()).digest('base64')
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

const sortByDate = (data) => data.sort(({ date: first }, { date: second }) => moment(first) - moment(second))

const configureCalendar = (data, startDate = null) => {
  if (data === null || data.length === 0) return null
  sortByDate(data)
  const startDateMoment = moment(startDate || data[0].date)
  const pad = startDateMoment.day()
  const noDay = { fullDayType: 'no-day' }
  const prePad = new Array(pad).fill(noDay)
  const monthPadTotal = startDateMoment.daysInMonth() + pad
  const totalCalendarSize = Math.ceil(monthPadTotal / 7) * 7
  const postPad = new Array(totalCalendarSize - monthPadTotal).fill(noDay)

  return [...prePad, ...data, ...postPad]
}

const getTaskText = (displayType) =>
  ({
    day_start: 'Start',
    day_finish: 'Finish',
    night_start: 'Start',
    night_finish: 'Finish',
    overtime_night_start: 'Start',
    overtime_night_finish: 'Finish',
  }[displayType])

const displayedTasks = [
  'day_start',
  'day_finish',
  'overtime_day_finish',
  'overtime_night_start',
  'overtime_night_finish',
  'night_start',
  'night_finish',
]

const processDay = (day) => {
  const { date, tasks: rawTasks } = day
  const dateMoment = moment(date)
  const today = dateMoment.isSame(moment(), 'day')
  const tasks = rawTasks.filter(({ displayType }) => displayedTasks.includes(displayType))
  tasks.forEach((task) => {
    const { displayType, eventTime } = task
    const eventText =
      displayType === 'overtime_day_finish'
        ? 'Overtime'
        : `${getTaskText(displayType)} ${moment(eventTime).format('HH:mm')}`
    Object.assign(task, { eventText })
  })
  Object.assign(day, { today, dateText: dateMoment.format('D'), dateDayText: dateMoment.format('dddd Do'), tasks })
}

const hmppsAuthMFAUser = (token) => jwtDecode(token).authorities.includes('ROLE_MFA')

const getSnoozeUntil = (rawSnoozeUntil) => {
  const snoozeUntil = moment(rawSnoozeUntil)
  return snoozeUntil.isAfter(moment()) ? snoozeUntil.add(1, 'day').format('dddd, Do MMMM YYYY') : ''
}

const appendUserErrorMessage = (error, userMessage = GENERAL_ERROR) => Object.assign(error, { userMessage })

module.exports = {
  getStartMonth,
  getEndDate,
  get2faCode,
  getAuthErrorDescription,
  createTwoFactorAuthenticationHash,
  sortByDate,
  configureCalendar,
  processDay,
  hmppsAuthMFAUser,
  getSnoozeUntil,
  appendUserErrorMessage,
}
