const moment = require('moment')
const CalendarPage = require('../pages/calendarPage')
const CalendarDetailPage = require('../pages/calendarDetailPage')

context('A staff member can view their calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubHealthCalls')
    cy.task('stubStaffLookup')
    cy.task('stubShifts')
    cy.login()
  })

  it('A staff member can view their calendar', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))

    // day shift
    const dayShift = calendarPage.day('2020-03-04')
    dayShift.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Wednesday, 4', '4', 'Start 07:30', 'Finish 17:15', '8hrs 45mins'])
    })
  })

  it('A staff member can drill into a day shift', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const dayShift = calendarPage.day('2020-03-04')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Friday 6 March 2020')
    calendarDetailPage.detailStart().should('contain', 'Start of shift').should('contain', 'Training - Internal')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')
  })

  it('A staff member can drill into a night shift', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const nightShift = calendarPage.day('2020-03-07')
    nightShift.click()

    // the title comes from the seed data, hence the jumping between dates
    const nightShiftPage = CalendarDetailPage.verifyOnPage('Sunday 22 March 2020')
    nightShiftPage.detailFinish().should('contain.text', 'End of shift')
    nightShiftPage.detailStartNight().should('contain', 'Start of shift').should('contain', 'Night Duties')
  })

  it('A staff member navigate to different days', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const dayShift = calendarPage.day('2020-03-04')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Friday 6 March 2020')
    calendarDetailPage.nextDay().should('contain.text', 'Saturday 7 March 2020').click()
    // the title comes from the seed data, hence the jumping between dates
    const nightShiftPage = CalendarDetailPage.verifyOnPage('Sunday 22 March 2020')
    nightShiftPage.previousDay().should('contain.text', 'Saturday 21 March 2020').click()

    CalendarDetailPage.verifyOnPage('Sunday 1 March 2020')
  })
})
