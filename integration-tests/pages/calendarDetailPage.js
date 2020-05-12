const page = require('./page')

const calendarDetailPage = (date) =>
  page(date, {
    detailStart: () => cy.get('.detail-start'),
    detailStartNight: () => cy.get('.detail-start-night'),
    detailFinish: () => cy.get('.detail-finish'),
    detailRestDay: () => cy.get('.detail-rest-day'),
    previousDay: () => cy.get('#btnPreviousShiftDetail'),
    nextDay: () => cy.get('#btnNextShiftDetail'),
  })

module.exports = {
  verifyOnPage: calendarDetailPage,
}
