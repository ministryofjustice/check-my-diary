const moment = require('moment')

const { GENERAL_ERROR } = require('./errorConstants')

function getStartMonth() {
  return moment().startOf('month').format('YYYY-MM-DD')
}

function getEndDate(startDate) {
  return moment(startDate).endOf('month').format('YYYY-MM-DD')
}

<<<<<<< HEAD
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

const removeShiftDetails = (details) => {
  return details.filter(({ displayType }) => !['day_start', 'day_finish'].includes(displayType))
}

const humanizeNumber = (value, unit) => {
  if (value === 0) return ''
  return `${value}${unit}${value > 1 ? 's' : ''}`
}

const getDuration = (duration) => {
  const displayTypeTimeRaw = moment.duration(duration, 'seconds')
  return `${humanizeNumber(displayTypeTimeRaw.hours(), 'hr')} ${humanizeNumber(
    displayTypeTimeRaw.minutes(),
    'min',
  )}`.trim()
}
=======
function configureCalendar(data, startDate) {
  if (data === null || data.shifts.length === 0) return { shifts: null }

  const convertedStartDate = moment(startDate)

  const daysInMonth = convertedStartDate.daysInMonth()
>>>>>>> 625a896... 🔥remove-bespoke-mfa

const configureCalendarDay = (day) => {
  const { fullDayType, details } = day
  sortByDisplayType(details)
  details.forEach(
    (detail) => detail.finishDuration && Object.assign(detail, { finishDuration: getDuration(detail.finishDuration) }),
  )
  if (!['SHIFT', 'SECONDMENT', 'TRAINING_EXTERNAL', 'TRAINING_INTERNAL', 'TOIL'].includes(fullDayType))
    Object.assign(day, { details: removeShiftDetails(details) })
}

const configureCalendar = (data, startDate = null) => {
  if (data === undefined || data == null || data.length === 0) return null
  sortByDate(data)
  data.forEach((day) => configureCalendarDay(day))
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
    DAY_START: 'Start',
    DAY_FINISH: 'Finish',
    NIGHT_START: 'Start',
    NIGHT_FINISH: 'Finish',
    OVERTIME_DAY_START: 'Start',
    OVERTIME_DAY_FINISH: 'Finish',
    OVERTIME_NIGHT_START: 'Start',
    OVERTIME_NIGHT_FINISH: 'Finish',
  }[displayType])

const displayedTasks = [
  'DAY_START',
  'DAY_FINISH',
  'NIGHT_START',
  'NIGHT_FINISH',
  'OVERTIME_DAY_START',
  'OVERTIME_DAY_FINISH',
  'OVERTIME_NIGHT_START',
  'OVERTIME_NIGHT_FINISH',
]

const processDay = (day) => {
  const { date, details: rawTasks } = day
  const dateMoment = moment(date)
  const today = dateMoment.isSame(moment(), 'day')
  const format = 'hh:mm:ss'
  const details = rawTasks.filter(
    ({ displayType, start }) => displayedTasks.includes(displayType) && !moment(start, format).isSame('00:00:00'),
  )
  // const sortedDetails = details.sort(d => d.start)
  details.forEach((detail) => {
    const { displayType, displayTypeTime } = detail
    const activity = `${getTaskText(displayType)} ${moment(displayTypeTime).format('HH:mm')}`
    Object.assign(detail, { activity, displayType: displayType.toLowerCase() })
  })
  sortByDate(details, 'displayTypeTime')
  Object.assign(day, { today, dateText: dateMoment.format('D'), dateDayText: dateMoment.format('dddd Do'), details })
}

const getSnoozeUntil = (rawSnoozeUntil) => {
  const snoozeUntil = moment(rawSnoozeUntil)
  return snoozeUntil.isAfter(moment()) ? snoozeUntil.add(1, 'day').format('dddd, Do MMMM YYYY') : ''
}

const appendUserErrorMessage = (error, userMessage = GENERAL_ERROR) => Object.assign(error, { userMessage })

const processDetail = (detail, detailIndex, details) => {
  const { start, end, displayType, activity } = detail
  let startText = start ? moment(start).format('HH:mm') : ''
  const endText = end ? moment(end).format('HH:mm') : ''
  let processedActivity = activity
  const processedDisplayType = displayType ? displayType.toLowerCase() : ''
  if (['DAY_FINISH', 'OVERTIME_DAY_FINISH'].includes(displayType)) {
    const lastDetail = detailIndex > 0 ? details[detailIndex - 1] : null
    if (lastDetail && lastDetail.start === start) {
      startText = ''
      processedActivity = ''
    } else {
      return [
        {
          start: startText,
          end: endText,
          displayType: 'activity',
          activity: processedActivity,
        },
        { displayType: processedDisplayType, end: endText },
      ]
    }
  }
  return {
    start: startText,
    end: endText,
    displayType: processedDisplayType,
    activity: processedActivity,
  }
}

module.exports = {
  getStartMonth,
  getEndDate,
<<<<<<< HEAD
  sortByDate,
  sortByDisplayType,
  configureCalendar,
  processDay,
  processDetail,
=======
  configureCalendar,
  processOvertimeShifts,
>>>>>>> 625a896... 🔥remove-bespoke-mfa
  getSnoozeUntil,
  appendUserErrorMessage,
}
