import { format } from 'date-fns'

import CalendarPage from '../pages/calendarPage'
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

  it('A staff member can view their overtime calendar', () => {
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    calendarPage.day(7).within(() => {
      cy.get('span.day').eq(0).contains('Saturday 7')
      cy.get('span.day').eq(1).contains('7')
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
      cy.get('span.day').eq(1).contains('20')
      cy.get('span.day').contains('Rest Day')
      cy.get('span.line').eq(0).contains('Overtime start: 12:30')
      cy.get('span.line').eq(0).contains('Constant Watch')
      cy.get('span.line').eq(1).contains('Overtime finish: 13:30')
      cy.get('span.line').eq(1).contains('Constant Watch')
      cy.get('span.line').eq(2).contains('1 hour')
    })

    calendarPage.day(21).within(() => {
      cy.get('span.day').eq(0).contains('Saturday 21')
      cy.get('span.day').eq(1).contains('21')
      cy.get('span.day').contains('Holiday')
      cy.get('span.line').eq(0).contains('Overtime start: 12:30')
      cy.get('span.line').eq(0).contains('Constant Watch')
      cy.get('span.line').eq(1).contains('Overtime finish: 13:30')
      cy.get('span.line').eq(1).contains('Constant Watch')
      cy.get('span.line').eq(2).contains('1 hour')
    })

    calendarPage.day(22).within(() => {
      cy.get('span.day').eq(0).contains('Sunday 22')
      cy.get('span.day').eq(1).contains('22')
      cy.get('span.day').contains('Rest Day')
      cy.get('span.line').eq(0).contains('Overtime night shift start: 22:30')
      cy.get('span.line').eq(0).contains('Constant Watch')
    })

    calendarPage.day(23).within(() => {
      cy.get('span.day').eq(0).contains('Monday 23')
      cy.get('span.day').eq(1).contains('23')
      cy.get('span.day').contains('Rest Day')
      cy.get('span.line').eq(0).contains('Overtime night shift finish: 07:30')
      cy.get('span.line').eq(1).contains('9 hours')
    })

    calendarPage.day(27).within(() => {
      cy.get('span.day').eq(0).contains('Friday 27')
      cy.get('span.day').eq(1).contains('27')
      cy.get('span.line').eq(0).contains('Night shift finish: 04:30')
      cy.get('span.line').eq(0).contains('Night Duties')
      cy.get('span.line').eq(1).contains('9 hours')
      cy.get('span.line')
        .eq(1)
        .should('have.attr', 'class')
        .then((clazz) => {
          expect(clazz).to.contains('night_finish')
        })
      cy.get('span.line').eq(2).contains('Night shift start: 22:45')
      cy.get('span.line').eq(2).contains('Night Duties')
      cy.get('span.line').eq(2).get('hr').should('be.visible')
    })
  })
})
