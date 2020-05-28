const page = require('./page')

const calendarDetailPage = (date) =>
  page(date, {
    detailStart: () => cy.get('.detail-start'),
    detailStartOvertime: () => cy.get('.detail-start-overtime'),
    detailStartNight: () => cy.get('.detail-start-night'),
    detailFinish: () => cy.get('.detail-finish'),
    detailFinishOvertime: () => cy.get('.detail-finish-overtime'),
    detailRestDay: () => cy.get('.detail-rest-day'),
    detailAbsence: () => cy.get('.detail-absence'),
    previousDay: () => cy.get('#btnPreviousShiftDetail'),
    nextDay: () => cy.get('#btnNextShiftDetail'),
  })

module.exports = {
  verifyOnPage: calendarDetailPage,
}
