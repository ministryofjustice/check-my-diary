import { format } from 'date-fns'

import CalendarPage, { mobileOrDesktopType } from '../pages/calendarPage'
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
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: false })
    cy.login()

    Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    cy.visit('/calendar/2020-04-01')
    cy.get('[data-qa=previous]').click()
  })

  it('A staff member can view their overtime calendar on mobile', () => {
    cy.viewport(350, 750)
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    calendarPage.day(7).within(() => {
      cy.get('span.day').eq(0).contains('Saturday 7')
      cy.get('span.line').eq(0).contains('Overtime start: 07:30')
      cy.get('span.line').eq(0).contains('Activities Duties')
      cy.get('span.line').eq(1).contains('Overtime finish: 12:30')
      cy.get('span.line').eq(1).contains('Activities Duties')
      cy.get('span.line').eq(2).contains('5 hours')
      cy.get('span.line').eq(3).contains('TOIL')
      cy.get('span.line').eq(4).contains('Start: 12:30')
      cy.get('span.line').eq(5).contains('Break: 17:00 - 17:30')
      cy.get('span.line').eq(6).contains('Finish: 21:00')
      cy.get('span.line').eq(7).contains('8 hours')
    })

    calendarPage.day(20).within(() => {
      cy.get('span.day').eq(0).contains('Friday 20')
      cy.get('span.day').contains('Rest Day')
      cy.get('span.line').eq(0).contains('Overtime start: 12:30')
      cy.get('span.line').eq(0).contains('Constant Watch')
      cy.get('span.line').eq(1).contains('Overtime finish: 13:30')
      cy.get('span.line').eq(1).contains('Constant Watch')
      cy.get('span.line').eq(2).contains('1 hour')
    })

    calendarPage.day(21).within(() => {
      cy.get('span.day').eq(0).contains('Saturday 21')
      cy.get('span.day').contains('Holiday')
      cy.get('span.line').eq(0).contains('Overtime start: 12:30')
      cy.get('span.line').eq(0).contains('Constant Watch')
      cy.get('span.line').eq(1).contains('Overtime finish: 13:30')
      cy.get('span.line').eq(1).contains('Constant Watch')
      cy.get('span.line').eq(2).contains('1 hour')
    })

    calendarPage.day(22).within(() => {
      cy.get('span.day').eq(0).contains('Sunday 22')
      cy.get('span.day').contains('Rest Day')
      cy.get('span.line').eq(0).contains('Overtime night shift start: 22:30')
      cy.get('span.line').eq(0).contains('Constant Watch')
    })

    calendarPage.shouldHaveClass(calendarPage.day(23), 'rest-day')
    calendarPage.day(23).within(() => {
      cy.get('span.day').eq(0).contains('Monday 23')
      calendarPage.shouldHaveClass(cy.get('div').eq(0), 'black-on-white')
      cy.get('span.day').should('not.contain', 'Rest Day')
      cy.get('span.line').eq(0).contains('Overtime night shift finish: 07:30')
      cy.get('span.line').eq(1).contains('9 hours')
      calendarPage.shouldHaveClassAtLine(1, 'night_finish')
      cy.get('span.line').eq(2).contains('Rest Day')
    })

    calendarPage.day(27).within(() => {
      cy.get('span.day').eq(0).contains('Friday 27')
      cy.get('span.line').eq(0).contains('Night shift finish: 04:30')
      cy.get('span.line').eq(0).contains('Night Duties')
      cy.get('span.line').eq(1).contains('9 hours')
      calendarPage.shouldHaveClassAtLine(1, 'night_finish')
      cy.get('span.line').eq(2).contains('Night shift start: 22:45')
      cy.get('span.line').eq(2).contains('Night Duties')
      cy.get('span.line').eq(2).get('hr').should('be.visible')
    })
  })

  it('A staff member can view their overtime calendar on desktop', () => {
    cy.viewport(1200, 750)
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    calendarPage.day(7, mobileOrDesktopType.desktop).within(() => {
      cy.get('span.day').eq(0).contains('7')
      cy.get('span.line').eq(0).contains('Overtime start: 07:30')
      cy.get('span.line').eq(0).contains('Activities Duties')
      cy.get('span.line').eq(1).contains('Overtime finish: 12:30')
      cy.get('span.line').eq(1).contains('Activities Duties')
      cy.get('span.line').eq(2).contains('5 hours')
      cy.get('span.line').eq(3).contains('TOIL')
      cy.get('span.line').eq(4).contains('Start: 12:30')
      cy.get('span.line').eq(5).contains('Break: 17:00 - 17:30')
      cy.get('span.line').eq(6).contains('Finish: 21:00')
      cy.get('span.line').eq(7).contains('8 hours')
    })

    calendarPage.day(21, mobileOrDesktopType.desktop).within(() => {
      cy.get('span.line').eq(0).contains('Holiday')
      cy.get('span.line').eq(1).contains('Overtime start: 12:30')
      cy.get('span.line').eq(1).contains('Constant Watch')
      cy.get('span.line').eq(2).contains('Overtime finish: 13:30')
      cy.get('span.line').eq(2).contains('Constant Watch')
      cy.get('span.line').eq(3).contains('1 hour')
    })

    calendarPage.shouldHaveClass(calendarPage.day(23), 'rest-day')
    calendarPage.day(23).within(() => {
      cy.get('span.day').eq(0).contains('Monday 23')
      calendarPage.shouldHaveClass(cy.get('div').eq(0), 'black-on-white')
      cy.get('span.day').should('not.contain', 'Rest Day')
      cy.get('span.line').eq(0).contains('Overtime night shift finish: 07:30')
      cy.get('span.line').eq(1).contains('9 hours')
      calendarPage.shouldHaveClassAtLine(1, 'night_finish')
      cy.get('span.line').eq(2).contains('Rest Day')
    })

    calendarPage.day(27, mobileOrDesktopType.desktop).within(() => {
      cy.get('span.line').eq(0).contains('Night shift finish: 04:30')
      cy.get('span.line').eq(0).contains('Night Duties')
      cy.get('span.line').eq(1).contains('9 hours')
      calendarPage.shouldHaveClassAtLine(1, 'night_finish')
      cy.get('span.line').eq(2).contains('Night shift start: 22:45')
      cy.get('span.line').eq(2).contains('Night Duties')
      cy.get('span.line').eq(2).get('hr').should('be.visible')
    })
  })
})
