const moment = require('moment')

function getStartMonth() {
  return moment().startOf('month').format('YYYY-MM-DD')
}

function getEndDate(startDate) {
  return moment(startDate).endOf('month').format('YYYY-MM-DD')
}

function isNullOrEmpty(str) {
  return !str || str.length === 0
}

function configureCalendar(data, startDate) {
  if (data === null || data.shifts.length === 0) return { shifts: null }

  const convertedStartDate = moment(startDate)

  const daysInMonth = convertedStartDate.daysInMonth()

  const pad = convertedStartDate.day()

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
  isNullOrEmpty,
  configureCalendar,
  processOvertimeShifts,
}
