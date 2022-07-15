import { format } from 'date-fns'

import Page from '../pages/page'
import CalendarPage from '../pages/calendarPage'
import ContactUsPage from '../pages/contactUsPage'

context('Contact us functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubNotificationPreferencesGet', {})
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: true, emailVerified: true })
  })

  it('Link on pages takes user to contact us', () => {
    cy.task('stubLogin')
    cy.login()
    Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    cy.get('#contactUsLink').click()
    Page.verifyOnPage(ContactUsPage)
  })
})
