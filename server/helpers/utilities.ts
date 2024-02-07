import { add, format, getDay, getDaysInMonth, intervalToDuration, isFuture, isToday, startOfMonth } from 'date-fns'

import crypto from 'crypto'
import { CalendarDay, Details } from './utilities.types'

const TIME_FORMAT = 'HH:mm:ss'

function getStartMonth() {
  return format(startOfMonth(new Date()), 'yyyy-MM-dd')
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
      const date = displayTypeTime || start || ''
      const compareDate = compareDisplayTypeTime || compareStart || ''
      const comparison = date.localeCompare(compareDate)
      if (comparison !== 0) return comparison
      return displayType && displayType.toLowerCase().includes('finish') ? -1 : 1
    },
  )

const humanizeNumber = (value: number | undefined, unit: string) => {
  if (!value) return '' // including zero
  return `${value} ${unit}${value > 1 ? 's' : ''}`
}

const getDuration = (duration: number) => {
  if (!duration) {
    return duration
  }
  const raw = intervalToDuration({ start: 0, end: duration * 1000 })
  return `${humanizeNumber(raw.hours, 'hour')} ${humanizeNumber(raw.minutes, 'minute')}`
}

const configureCalendar = (data: CalendarDay[]) => {
  if (data.length === 0) return null
  const processedData: CalendarDay[] = data.map(processDay)
  sortByDate(processedData)
  const startDate = new Date(processedData[0].date)
  const pad = getDay(startDate) // day of week!, sunday 0
  const noDay = { fullDayType: 'no-day' }
  const prePad = new Array(pad).fill(noDay)
  const monthPadTotal = getDaysInMonth(startDate) + pad
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
  { description: 'Maternity Leave', class: 'absence' },
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
      TU_OFFICIALS_LEAVE_DAYS: 'tu-official', //  deprecated
      TU_OFFICIALS_LEAVE_HOURS: 'tu-official', // deprecated
      TU_OFFICIALS_LEAVE: 'tu-official',
      TU_OFFICIALS_LEAVE_2: 'tu-official',
      TRAINING_EXTERNAL: 'training-external',
      TRAINING_INTERNAL: 'training-internal',
      NIGHT_FINISH: 'night_finish',
      OVERTIME_NIGHT_FINISH: 'overtime_night_finish',
    }[type] || 'otherType'
  )
}

const fullDayMatch = (desc: string) => {
  const foundValue = fullDayActivities.find((a) => desc.startsWith(a.description))
  return foundValue && foundValue.class
}

const unionFilter = (activity: string | undefined) =>
  activity && (activity.startsWith('Union Duties') || activity.startsWith('Union Facility'))
    ? 'Trade Union Official Duties'
    : activity

const isMidnight = (start: string | undefined, end: string | undefined) =>
  start &&
  format(new Date(start), TIME_FORMAT) === '00:00:00' &&
  end &&
  format(new Date(end), TIME_FORMAT) === '00:00:00'

const processDay = (day: CalendarDay): CalendarDay => {
  const { date, details, fullDayType, fullDayTypeDescription } = day
  const dateDate = new Date(date)
  const today = isToday(dateDate)
  const isFullDay = fullDayType !== 'NONE' && fullDayType !== 'SHIFT'

  let nightFinish = false
  let nightFinishDetected = false

  const processedDetails = details
    .filter(({ start, end }) => !(isFullDay && isMidnight(start, end)))
    .map((detail, index): Details => {
      const { displayType, displayTypeTime, start, end, activity } = detail

      if (displayType) {
        const specialActivityColour = (!isFullDay && displayType.endsWith('START') && fullDayMatch(activity)) || ''
        const specialActivityStartEndColour =
          ((displayType.endsWith('START') || displayType.endsWith('FINISH')) && fullDayMatch(activity)) || ''
        const showNightHr = nightFinish && displayType === 'NIGHT_START' // dont show a <hr> for night overtime because the start/end colours are different
        nightFinish = displayType === 'NIGHT_FINISH' || displayType === 'OVERTIME_NIGHT_FINISH'
        if (nightFinish && index === 0) {
          nightFinishDetected = true
        }
        const durationColour = nightFinish
          ? specialActivityStartEndColour || getTypeClass(displayType, true)
          : (!isFullDay && displayType.endsWith('FINISH') && fullDayMatch(activity)) || ''
        return {
          ...detail,
          lineLeftText: `${getTaskText(displayType)}: ${displayTypeTime && format(new Date(displayTypeTime), 'HH:mm')}`,
          lineRightText: specialActivityStartEndColour ? '' : unionFilter(activity),
          displayType: specialActivityStartEndColour || displayType.toLowerCase(),
          activityDescription: unionFilter(activity),
          finishDuration: getDuration(detail.finishDuration as number),
          specialActivityColour,
          durationColour,
          showNightHr,
        }
      }

      const startText = start ? format(new Date(start), 'HH:mm') : ''
      const endText = end ? format(new Date(end), 'HH:mm') : ''
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
    dateText: format(dateDate, 'd'),
    dateDayText: format(dateDate, 'eeee d'),
    dateScreenReaderText: format(dateDate, 'eeee do MMMM'),
    details: processedDetails,
    isFullDay,
    fullDayType: getTypeClass(fullDayType, isFullDay),
    fullDayTypeDescription: unionFilter(fullDayTypeDescription),
    nightFinishDetected,
  }
}

const getSnoozeUntil = (rawSnoozeUntil: string) => {
  const snoozeUntil = new Date(rawSnoozeUntil)
  return isFuture(snoozeUntil) ? format(add(snoozeUntil, { days: 1 }), 'd MMMM yyyy') : ''
}

export default {
  getStartMonth,
  get2faCode,
  createTwoFactorAuthenticationHash,
  sortByDate,
  sortByDisplayType,
  configureCalendar,
  processDay,
  getSnoozeUntil,
}
