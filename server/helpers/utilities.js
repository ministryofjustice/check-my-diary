const moment = require('moment')
const crypto = require('crypto')
const jwtDecode = require('jwt-decode')

const log = require('../../log')

const format = 'HH:mm:ss'

function getStartMonth() {
  return moment().startOf('month').format('YYYY-MM-DD')
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
    'Service temporarily unavailable. Please try again later. If this issue persists, please contact the Helpdesk on 0800 917 5148.'
  if (error.message !== '') {
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
      type = '<p>We do not have a valid email address for you.</p><p>Please call the Service Desk on 0800 917 5148</p>'
    } else if (
      error.message.includes('phone_number Not enough digits') ||
      error.message.includes('phone_number Must not contain letters or symbols') ||
      error.message.includes('phone_number Too many digits')
    ) {
      type =
        '<p>We do not have a valid mobile phone number for you.</p><p>Please call the Service Desk on 0800 917 5148</p>'
    }
  }
  return type
}

const sortByDate = (data, dateField = 'date') =>
  data.sort((first, second) => moment(first[dateField]) - moment(second[dateField]))

const sortByDisplayType = (data) =>
  data.sort(
    ({ displayTypeTime, displayType, start }, { displayTypeTime: compareDisplayTypeTime, start: compareStart }) => {
      const date = displayTypeTime || start
      const compareDate = compareDisplayTypeTime || compareStart
      const comparison = moment(date) - moment(compareDate)
      if (comparison !== 0) return comparison
      return displayType && displayType.toLowerCase().includes('finish') ? -1 : 1
    },
  )

const humanizeNumber = (value, unit) => {
  if (value === 0) return ''
  return `${value} ${unit}${value > 1 ? 's' : ''}`
}

const getDuration = (duration) => {
  if (!duration) {
    return duration
  }
  const raw = moment.duration(duration, 'seconds')
  return `${humanizeNumber(raw.hours(), 'hour')} ${humanizeNumber(raw.minutes(), 'minute')}`
}

const configureCalendar = (data, startDate = null) => {
  if (data.length === 0) return null
  const processedData = data.map(processDay)
  sortByDate(processedData)
  const startDateMoment = moment(startDate || processedData[0].date)
  const pad = startDateMoment.day()
  const noDay = { fullDayType: 'no-day' }
  const prePad = new Array(pad).fill(noDay)
  const monthPadTotal = startDateMoment.daysInMonth() + pad
  const totalCalendarSize = Math.ceil(monthPadTotal / 7) * 7
  const postPad = new Array(totalCalendarSize - monthPadTotal).fill(noDay)

  return [...prePad, ...processedData, ...postPad]
}

const getTaskText = (displayType) =>
  displayType &&
  {
    DAY_START: 'Start',
    DAY_FINISH: 'Finish',
    NIGHT_START: 'Night shift start',
    NIGHT_FINISH: 'Night shift finish',
    OVERTIME_DAY_START: 'Overtime start',
    OVERTIME_DAY_FINISH: 'Overtime finish',
    OVERTIME_NIGHT_START: 'Overtime night shift start',
    OVERTIME_NIGHT_FINISH: 'Overtime night shift finish',
  }[displayType]

const fullDayActivities = [
  // from cmd-api FullDayActivityType
  { description: 'Rest Day', class: 'rest-day' },
  { description: 'Annual Leave', class: 'absence' },
  { description: 'Training - Internal', class: 'training-internal' },
  { description: 'Training - External', class: 'training-external' },
  { description: 'Sick', class: 'illness' },
  { description: 'Absence', class: 'absence' },
  { description: 'Authorised Absence', class: 'absence' },
  { description: 'Union Duties', class: 'tu-official' },
  { description: 'Union Facility', class: 'tu-official' },
  { description: 'Detached Duty', class: 'detached-duty' },
  { description: 'TOIL', class: 'otherType' },
]

const getTypeClass = (type, isFullDay) => {
  if (type === 'no-day') {
    return type
  }
  if (!isFullDay) {
    return ''
  }
  return (
    {
      REST_DAY: 'rest-day',
      HOLIDAY: 'holiday',
      ILLNESS: 'illness',
      ABSENCE: 'absence',
      NONE: 'no-day',
      SHIFT: 'shift',
      DETACHED_DUTY: 'detached-duty',
      SECONDMENT: 'detached-duty',
      TU_OFFICIALS_LEAVE_DAYS: 'tu-official',
      TU_OFFICIALS_LEAVE_HOURS: 'tu-official',
      TRAINING_EXTERNAL: 'training-external',
      TRAINING_INTERNAL: 'training-internal',
      NIGHT_FINISH: 'night_finish',
      OVERTIME_NIGHT_FINISH: 'overtime_night_finish',
    }[type] || 'otherType'
  )
}

const fullDayMatch = (desc) => {
  const foundValue = fullDayActivities.find((a) => desc.startsWith(a.description))
  return foundValue && foundValue.class
}

const unionFilter = (activity) =>
  activity && (activity.startsWith('Union Duties') || activity.startsWith('Union Facility'))
    ? 'Trade Union Official Duties'
    : activity

const processDay = (day) => {
  const { date, details, fullDayType, fullDayTypeDescription } = day
  const dateMoment = moment(date)
  const today = dateMoment.isSame(moment(), 'day')

  const isFullDay =
    fullDayType !== 'NONE' &&
    fullDayType !== 'SHIFT' &&
    !details.some((detail) => detail.displayType === 'NIGHT_FINISH')

  let nightFinish = false

  const processedDetails = details
    .filter(
      ({ start, end }) =>
        !(isFullDay && moment(start).format(format) === '00:00:00' && moment(end).format(format) === '00:00:00'),
    )
    .map((detail) => {
      const { displayType, displayTypeTime, start, end, activity } = detail
      const startText = start ? moment(start).format('HH:mm') : ''
      const endText = end ? moment(end).format('HH:mm') : ''

      if (displayType) {
        const specialActivityColour = (!isFullDay && displayType.endsWith('START') && fullDayMatch(activity)) || ''
        const specialActivityStartEndColour =
          ((displayType.endsWith('START') || displayType.endsWith('FINISH')) && fullDayMatch(activity)) || ''
        const showNightHr = nightFinish && displayType === 'NIGHT_START' // dont show a <hr> for night overtime because the start/end colours are different
        nightFinish = displayType === 'NIGHT_FINISH' || displayType === 'OVERTIME_NIGHT_FINISH'
        const durationColour = nightFinish
          ? getTypeClass(displayType, true)
          : (!isFullDay && displayType.endsWith('FINISH') && fullDayMatch(activity)) || ''
        return {
          ...detail,
          lineLeftText: `${getTaskText(displayType)}: ${moment(displayTypeTime).format('HH:mm')}`,
          lineRightText: specialActivityStartEndColour ? '' : unionFilter(activity),
          displayType: specialActivityStartEndColour || displayType.toLowerCase(),
          activityDescription: unionFilter(activity),
          finishDuration: getDuration(detail.finishDuration),
          specialActivityColour,
          durationColour,
          showNightHr,
        }
      }

      return {
        ...detail,
        lineLeftText: `${activity.startsWith('Break') ? 'Break' : activity}: ${startText} - ${endText}`,
        displayType: '',
        displayTypeTime: start,
      }
    })

  sortByDisplayType(processedDetails)

  return {
    ...day,
    today,
    dateText: dateMoment.format('D'),
    dateDayText: dateMoment.format('dddd D'),
    details: processedDetails,
    isFullDay,
    fullDayType: getTypeClass(fullDayType, isFullDay),
    fullDayTypeDescription: unionFilter(fullDayTypeDescription),
  }
}

const hmppsAuthMFAUser = (token) => {
  const { authorities } = jwtDecode(token)
  return authorities.includes('ROLE_MFA') || authorities.includes('ROLE_CMD_MIGRATED_MFA')
}

const getSnoozeUntil = (rawSnoozeUntil) => {
  const snoozeUntil = moment(rawSnoozeUntil)
  return snoozeUntil.isAfter(moment()) ? snoozeUntil.add(1, 'day').format('D MMMM YYYY') : ''
}

module.exports = {
  getStartMonth,
  get2faCode,
  getAuthErrorDescription,
  createTwoFactorAuthenticationHash,
  sortByDate,
  sortByDisplayType,
  configureCalendar,
  processDay,
  hmppsAuthMFAUser,
  getSnoozeUntil,
}
