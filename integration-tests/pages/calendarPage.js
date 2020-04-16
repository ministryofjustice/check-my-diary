const page = require('./page')

const calendarPage = (monthYear) =>
  page(monthYear, {
    day: (date) => cy.get(`a[href="/details/${date}"]`),
    nextMonth: () => cy.get('[data-qa=statement]'),
    previousMonth: () => cy.get('[data-qa=last-training]'),
    notifications: () => cy.get('[data-qa=job-start-year]'),
  })

module.exports = {
  verifyOnPage: calendarPage,
}
