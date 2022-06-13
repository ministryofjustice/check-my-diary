import moment from 'moment'
import CalendarPage from '../pages/calendarPage'
import CalendarDetailPage from '../pages/calendarDetailPage'
import Page from '../pages/page'

context('A staff member can view their overtime calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubNotificationPreferencesGet', {
      preference: 'EMAIL',
      email: 'me@gmail.com',
    })
    cy.login()

    Page.verifyOnPageTitle(CalendarPage, moment().format('MMMM YYYY'))
    cy.visit('/calendar/2020-04-01')
    cy.get('[data-qa=previous]').click()
  })

  it('A staff member can view their overtime calendar', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-07')
    dayShift.within(() => {
      cy.get('span').eq(0).contains('Saturday 7th')
      cy.get('span').eq(1).contains('7')
      cy.get('span').eq(2).contains('Start 07:30')
      cy.get('span').eq(3).contains('Finish 12:30')
      cy.get('span').eq(4).contains('5hrs')
      cy.get('span').eq(5).contains('Start 12:30')
      cy.get('span').eq(6).contains('Finish 21:00')
      cy.get('span').eq(7).contains('8hrs')
    })

    const restDay = calendarPage.day('2020-03-20')
    restDay.within(() => {
      cy.get('span').eq(0).contains('Friday 20th')
      cy.get('span').eq(1).contains('20')
      cy.get('span').eq(2).contains('Rest Day')
      cy.get('span').eq(3).contains('Start 12:30')
      cy.get('span').eq(4).contains('Finish 13:30')
      cy.get('span').eq(5).contains('1hr')
    })

    const holiday = calendarPage.day('2020-03-21')
    holiday.within(() => {
      cy.get('span').eq(0).contains('Saturday 21st')
      cy.get('span').eq(1).contains('21')
      cy.get('span').eq(2).contains('Holiday')
      cy.get('span').eq(3).contains('Start 12:30')
      cy.get('span').eq(4).contains('Finish 13:30')
      cy.get('span').eq(5).contains('1hr')
    })

    const nightShiftStart = calendarPage.day('2020-03-22')
    nightShiftStart.within(() => {
      cy.get('span').eq(0).contains('Sunday 22nd')
      cy.get('span').eq(1).contains('22')
      cy.get('span').eq(2).contains('Rest Day')
      cy.get('span').eq(3).contains('Start 22:30')
    })

    const nightShift = calendarPage.day('2020-03-23')
    nightShift.within(() => {
      cy.get('span').eq(0).contains('Monday 23rd')
      cy.get('span').eq(1).contains('23')
      cy.get('span').eq(2).contains('Rest Day')
      cy.get('span').eq(3).contains('Finish 07:30')
      cy.get('span').eq(4).contains('9hrs')
    })
  })

  it('A staff member can drill into a day shift with overtime', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-07')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Saturday, 7th March 2020')
    calendarDetailPage.detailStart().should('contain', 'Start of shift').should('contain', 'Duty Manager')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')

    calendarDetailPage
      .detailStartOvertime()
      .should('contain', 'Start of overtime')
      .should('contain', 'Activities Duties')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')
  })

  it('A staff member can drill into a rest day with overtime', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-20')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 20th March 2020')
    calendarDetailPage.detailRestDay().should('contain', 'Rest Day')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start of overtime').should('contain', 'Constant Watch')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')
  })

  it('A staff member can drill into a holiday with overtime', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-21')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Saturday, 21st March 2020')
    calendarDetailPage.detailHoliday().should('contain', 'Holiday')

    calendarDetailPage.detailStartOvertime().should('contain', 'Start of overtime').should('contain', 'Constant Watch')
    calendarDetailPage.detailFinishOvertime().should('contain.text', 'End of overtime')
  })

  it('A staff member can drill into a night shift start with overtime', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-22')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Sunday, 22nd March 2020')
    calendarDetailPage
      .detailOvertimeStartNight()
      .should('contain', 'Start of overtime night shift')
      .should('contain', 'Constant Watch')
  })

  it('A staff member can drill into a night shift end with overtime', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-23')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Monday, 23rd March 2020')
    calendarDetailPage
      .detailOvertimeFinishNight()
      .should('contain', '07:30')
      .should('contain', 'End of overtime night shift')
      .should('contain', 'Constant Watch')
  })

  it('A staff member can drill into a night shift with overtime', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment('2020-03-01').format('MMMM YYYY'))

    const dayShift = calendarPage.day('2020-03-27')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 27th March 2020')
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
