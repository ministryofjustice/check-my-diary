import moment from 'moment'
import dateFns from 'date-fns'

import crypto from 'crypto'
import jwtDecode from 'jwt-decode'
import { CalendarDay, Details } from './utilities.types'

const format = 'HH:mm:ss'

function getStartMonth() {
  return moment().startOf('month').format('YYYY-MM-DD')
}

function get2faCode() {
  return Math.floor(Math.random() * 899999 + 100000)
}

function createTwoFactorAuthenticationHash(input: string) {
  return crypto.createHash('sha256').update(input.toString()).digest('base64')
}

const sortByDate = (data: CalendarDay[], dateField = 'date') =>
  data.sort((first: CalendarDay, second: CalendarDay) => first[dateField].localeCompare(second[dateField]))

const sortByDisplayType = (data: Details[]) =>
  data.sort(
    ({ displayTypeTime, displayType, start }, { displayTypeTime: compareDisplayTypeTime, start: compareStart }) => {
      const date: string = displayTypeTime || start || ''
      const compareDate = compareDisplayTypeTime || compareStart || ''
      const comparison = date?.localeCompare(compareDate)
      if (comparison !== 0) return comparison
      return displayType && displayType.toLowerCase().includes('finish') ? -1 : 1
    },
  )

const humanizeNumber = (value: number, unit: string) => {
  if (value === 0) return ''
  return `${value} ${unit}${value > 1 ? 's' : ''}`
}

const getDuration = (duration?: string | number | null) => {
  if (!duration) {
    return duration
  }
  const raw = moment.duration(duration, 'seconds')
  return `${humanizeNumber(raw.hours(), 'hour')} ${humanizeNumber(raw.minutes(), 'minute')}`
}

const configureCalendar = (data: CalendarDay[], startDate = null) => {
  if (data.length === 0) return null
  const processedData: CalendarDay[] = data.map(processDay)
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

const getTaskText = (displayType: string) =>
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

const getTypeClass = (type: string, isFullDay: boolean) => {
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

const fullDayMatch = (desc?: string) => {
  const foundValue = fullDayActivities.find((a) => desc?.startsWith(a.description))
  return foundValue && foundValue.class
}

const unionFilter = (activity?: string) =>
  activity && (activity.startsWith('Union Duties') || activity.startsWith('Union Facility'))
    ? 'Trade Union Official Duties'
    : activity

const processDay = (day: CalendarDay): CalendarDay => {
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
    .map((detail): Details => {
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

const hmppsAuthMFAUser = (token: string) => {
  const { authorities } = jwtDecode<{ authorities: string[] }>(token)
  return authorities.includes('ROLE_MFA') || authorities.includes('ROLE_CMD_MIGRATED_MFA')
}

const getSnoozeUntil = (rawSnoozeUntil?: Date) => {
  const snoozeUntil = moment(rawSnoozeUntil)
  return snoozeUntil.isAfter(moment()) ? snoozeUntil.add(1, 'day').format('D MMMM YYYY') : ''
}

export default {
  getStartMonth,
  get2faCode,
  createTwoFactorAuthenticationHash,
  sortByDate,
  sortByDisplayType,
  configureCalendar,
  processDay,
  hmppsAuthMFAUser,
  getSnoozeUntil,
}
