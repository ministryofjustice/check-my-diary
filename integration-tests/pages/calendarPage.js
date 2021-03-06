const page = require('./page')

const calendarPage = (monthYear) =>
  page(monthYear, {
    notificationTab: () => cy.get(`a[href="/notifications"]`),
    day: (date) => cy.get(`a[href="/details/${date}"]`),
    nextMonth: (date) => cy.get(`a[href="/calendar/${date}"]`),
    previousMonth: (date) => cy.get(`a[href="/calendar/${date}"]`),
  })

module.exports = {
  verifyOnPage: calendarPage,
}
