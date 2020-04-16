const page = require('./page')

const calendarDetailPage = (date) =>
  page(date, {
    detailStart: () => cy.get('.detail-start'),
    previousDay: () => cy.get('#btnPreviousShiftDetail'),
    nextDay: () => cy.get('#btnNextShiftDetail'),
  })

module.exports = {
  verifyOnPage: calendarDetailPage,
}
