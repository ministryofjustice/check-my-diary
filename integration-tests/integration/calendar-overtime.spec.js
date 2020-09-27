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

    const dayShift = calendarPage.day('2020-03-07')
    dayShift.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq([
        'Saturday 7th',
        '7',
        'Start 07:30',
        'Finish 12:30',
        '5hrs',
        'Start 12:30',
        'Finish 21:00',
        '8hrs',
      ])
    })

    const restDay = calendarPage.day('2020-03-20')
    restDay.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Friday 20th', '20', 'Rest Day', 'Start 12:30', 'Finish 13:30', '1hr'])
    })

    const holiday = calendarPage.day('2020-03-21')
    holiday.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Saturday 21st', '21', 'Holiday', 'Start 12:30', 'Finish 13:30', '1hr'])
    })

    const nightShiftStart = calendarPage.day('2020-03-22')
    nightShiftStart.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Sunday 22nd', '22', 'Rest Day', 'Start 22:30'])
    })

    const nightShift = calendarPage.day('2020-03-23')
    nightShift.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Monday 23rd', '23', 'Rest Day', 'Finish 07:30', '9hrs'])
    })
  })

  it('A staff member can drill into a day shift with overtime', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-07')
    dayShift.click({ force: true })

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Saturday, 7th March 2020')
    calendarDetailPage.detailStart().should('contain', 'Start of shift').should('contain', 'Duty Manager')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')

    calendarDetailPage
      .detailStartOvertime()
      .should('contain', 'Start of overtime')
      .should('contain', 'Activities Duties')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')
  })

  it('A staff member can drill into a rest day with overtime', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-20')
    dayShift.click({ force: true })

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Friday, 20th March 2020')
    calendarDetailPage.detailRestDay().should('contain', 'Rest Day')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start of overtime').should('contain', 'Constant Watch')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')
  })

  it('A staff member can drill into a holiday with overtime', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-21')
    dayShift.click({ force: true })

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Saturday, 21st March 2020')
    calendarDetailPage.detailHoliday().should('contain', 'Holiday')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start of overtime').should('contain', 'Constant Watch')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')
  })

  it('A staff member can drill into a night shift start with overtime', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-22')
    dayShift.click({ force: true })

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Sunday, 22nd March 2020')
    calendarDetailPage
      .detailOvertimeStartNight()
      .should('contain', 'Start of overtime night shift')
      .should('contain', 'Constant Watch')
  })

  it('A staff member can drill into a night shift end with overtime', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-23')
    dayShift.click({ force: true })

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Monday, 23rd March 2020')
    calendarDetailPage
      .detailOvertimeFinishNight()
      .should('contain', '07:30')
      .should('contain', 'End of overtime night shift')
      .should('contain', 'Constant Watch')
  })

  it('A staff member can drill into a night shift with overtime', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-27')
    dayShift.click({ force: true })

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Friday, 27th March 2020')
    calendarDetailPage
      .detailFinishNight()
      .should('contain', '04:30')
      .should('contain', 'End of night shift')
      .should('contain', 'Night Duties')

    calendarDetailPage
      .detailStartOvertime()
      .should('contain', 'Start of overtime')
      .should('contain', 'Activities Duties')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')

    calendarDetailPage.detailStart().should('contain', 'Start of shift').should('contain', 'Duty Manager')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')
  })
})
