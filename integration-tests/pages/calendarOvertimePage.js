const page = require('./page')

const calendarOvertimePage = (monthYear) =>
  page(monthYear, {
    day: (date) => cy.get(`a[href="/overtime-details/${date}"]`),
    nextMonth: (date) => cy.get(`a[href="/calendar-overtime/${date}"]`),
    previousMonth: (date) => cy.get(`a[href="/calendar-overtime/${date}"]`),
  })

module.exports = {
  verifyOnPage: calendarOvertimePage,
}
