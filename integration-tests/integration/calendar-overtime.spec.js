const moment = require('moment')
const CalendarPage = require('../pages/calendarPage')
const CalendarDetailPage = require('../pages/calendarDetailPage')
const utilities = require('../helpers/utililies')

context('A staff member can view their overtime calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.login()

    utilities.gotoPreviousCalendarDate('2020-03-01')
  })

  it('A staff member can view their overtime calendar', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-08')
    dayShift.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Sunday, 8', '8', 'Start 07:30', 'Finish 17:15', '8hrs 45mins', 'Overtime'])
    })

    const restDay = calendarPage.day('2020-03-09')
    restDay.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Monday, 9', '9', 'Rest day', 'Overtime'])
    })

    const holiday = calendarPage.day('2020-03-28')
    holiday.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Saturday, 28', '28', 'Holiday', 'Overtime'])
    })

    const nightShiftStart = calendarPage.day('2020-03-22')
    nightShiftStart.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Sunday, 22', '22', 'Overtime', 'Start 20:45'])
    })

    const nightShift = calendarPage.day('2020-03-24')
    nightShift.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Tuesday, 24', '24', 'Finish 07:30', 'Overtime', 'Start 20:45'])
    })

    const nightShiftFinish = calendarPage.day('2020-03-26')
    nightShiftFinish.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Thursday, 26', '26', 'Finish 07:45', '10hrs 30mins', 'Overtime'])
    })
  })

  it('A staff member can drill into a day shift with overtime', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-08')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Sunday, 8th March 2020')
    calendarDetailPage.detailStart().should('contain', 'Start').should('contain', 'Visits Manager')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start').should('contain', 'Visits Manager')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End')
  })

  it('A staff member can drill into a rest day with overtime', () => {
    cy.task('stubTasks')

    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-09')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Monday, 9th March 2020')
    calendarDetailPage.detailRestDay().should('contain', 'Rest Day')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start').should('contain', 'Visits Manager')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End')
  })

  it('A staff member can drill into a holiday with overtime', () => {
    cy.task('stubTasks')

    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-28')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Saturday, 28th March 2020')
    calendarDetailPage.detailAbsence().should('contain', 'Holiday')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start').should('contain', 'Visits Manager')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End')
  })

  it('A staff member can drill into a night shift start with overtime', () => {
    cy.task('stubTasks')

    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-22')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Sunday, 22nd March 2020')
    calendarDetailPage.detailStartNight().should('contain', 'Start').should('contain', 'Night Duties')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start').should('contain', 'Visits Manager')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End')
  })

  it('A staff member can drill into a night shift end with overtime', () => {
    cy.task('stubTasks')

    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-26')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Thursday, 26th March 2020')
    calendarDetailPage.detailFinish().should('contain', '07:45').should('contain', 'End of shift')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start').should('contain', 'Visits Manager')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End')
  })

  it('A staff member can drill into a night shift with overtime', () => {
    cy.task('stubTasks')

    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-24')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Tuesday, 24th March 2020')
    calendarDetailPage.detailFinish().should('contain', '07:30').should('contain', 'End of shift')
    calendarDetailPage.detailStartNight().should('contain', '20:45', 'Start').should('contain', 'Night Duties')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start').should('contain', 'Duty Manager')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End')
  })
})
