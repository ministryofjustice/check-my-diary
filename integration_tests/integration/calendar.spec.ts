import moment from 'moment'
import CalendarPage from '../pages/calendarPage'
import CalendarDetailPage from '../pages/calendarDetailPage'
import Page from '../pages/page'

context('A staff member can view their calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.login()

    Page.verifyOnPageTitle(CalendarPage, moment().format('MMMM YYYY'))
    cy.visit('/calendar/2020-05-01')
    cy.get('[data-qa=previous]').click()
    cy.get('[data-qa=previous]').click()
  })

  it('A staff member can view their calendar', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-06')
    dayShift.within(() => {
      cy.get('span').eq(0).should('contain.text', 'Friday 6th')
      cy.get('span').eq(1).contains('6')
      cy.get('span').eq(2).contains('Start 07:45')
      cy.get('span').eq(3).contains('Finish 19:30')
      cy.get('span').eq(4).contains('10hrs 15mins')
    })
  })

  it('A staff member can drill into a day shift', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-06')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 6th March 2020')
    calendarDetailPage.detailStart().should('contain', 'Start of shift').should('contain', 'Training - Internal')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')
  })

  it('A staff member can drill into a night shift', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const nightShift = calendarPage.day('2020-03-26')
    nightShift.click({ force: true })

    // the title comes from the seed data, hence the jumping between dates
    const nightShiftPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Thursday, 26th March 2020')
    nightShiftPage.detailFinish().should('contain.text', 'End of shift')
    nightShiftPage.detailStartNight().should('contain', 'Start of night shift').should('contain', 'Night Duties')
  })

  it('A staff member navigate to different days', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-06')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 6th March 2020')
    calendarDetailPage.nextDay().should('contain.text', 'Saturday, 7th').click()
    // the title comes from the seed data, hence the jumping between dates
    const nightShiftPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Saturday, 7th March 2020')
    nightShiftPage.previousDay().should('contain.text', 'Friday, 6th').click()

    Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 6th March 2020')
  })
})