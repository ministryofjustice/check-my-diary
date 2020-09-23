const page = require('./page')

const calendarDetailPage = (date) =>
  page(date, {
    detailStart: () => cy.get('.day_start'),
    detailStartOvertime: () => cy.get('.overtime_day_start'),
    detailStartNight: () => cy.get('.night_start'),
    detailFinishNight: () => cy.get('.night_finish'),
    detailOvertimeStartNight: () => cy.get('.overtime_night_start'),
    detailOvertimeFinishNight: () => cy.get('.overtime_night_finish'),
    detailFinish: () => cy.get('.day_finish'),
    detailFinishOvertime: () => cy.get('.overtime_day_finish'),
    detailRestDay: () => cy.get('.rest-day'),
    detailHoliday: () => cy.get('.holiday'),
    previousDay: () => cy.get('#btnPreviousShiftDetail'),
    nextDay: () => cy.get('#btnNextShiftDetail'),
  })

module.exports = {
  verifyOnPage: calendarDetailPage,
}
