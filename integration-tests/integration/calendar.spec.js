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
    dayShift.should('contain.text', 'Wednesday, 4')
    dayShift
      .children('.detail-start')
      .should('contain.text', 'Start 07:30')
      .next()
      .should('contain.text', 'Finish 17:15')
      .next()
      .should('contain.text', '8hrs 45mins')
  })

  it('A staff member can drill into a day', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const dayShift = calendarPage.day('2020-03-04')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Friday 6 March 2020')
    calendarDetailPage
      .detailStart()
      .should('contain', 'Start of shift')
      .should('contain', 'Training - Internal')
      .next()
      .should('contain.text', 'Break (Unpaid)')
      .next()
      .should('contain.text', 'Duty Manager')
      .next()
      .should('contain.text', 'Present')
      .next()
      .should('contain.text', 'End of shift')
  })
})
