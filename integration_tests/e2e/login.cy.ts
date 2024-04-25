import { format } from 'date-fns'

import Page from '../pages/page'
import CalendarPage from '../pages/calendarPage'
import AuthSignInPage from '../pages/authSignIn'

context('Sign in functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubNotificationPreferencesGet', {
      preference: 'EMAIL',
      email: 'me@gmail.com',
    })
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: false })
  })

  it('Root (/) redirects to the auth sign in page if not signed in', () => {
    cy.task('stubLoginPage')
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Sign in page redirects to the auth sign in page if not signed in', () => {
    cy.task('stubLoginPage')
    cy.visit('/login')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Going to old auth pages now redirects to sign in or calendar', () => {
    cy.task('stubLogin')
    cy.login()
    cy.visit('/auth/login')
    Page.verifyOnPageTitle(CalendarPage, 'Your shift detail')
    cy.request({
      method: 'POST',
      url: '/auth/2fa',
      followRedirect: false,
    }).then((resp) => {
      expect(resp.status).to.eq(302)
      expect(resp.redirectedToUrl).to.eq('http://localhost:3007/')
    })
  })

  it('Sign out takes user to sign in page', () => {
    cy.task('stubLogin')
    cy.login()
    Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))

    // can't do a visit here as cypress requires only one domain
    cy.request('/logout').its('body').should('contain', 'Sign in')
  })

  it('Direct access to login callback takes user to sign in page', () => {
    cy.task('stubLogin')
    cy.visit('/login/callback')
    Page.verifyOnPage(AuthSignInPage)

    // can't do a visit here as cypress requires only one domain
    cy.task('getLoginUrl').then(cy.request).its('body').should('contain', 'Check my diary')
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.task('stubLogin')
    cy.login()
    Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.task('stubLogin')
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('token', { username: 'BBROWN', employeeName: 'Bobby Brown' })
    cy.login()

    calendarPage.headerUsername().contains('B. Brown')
  })

  it('User is signed in and header contains name', () => {
    cy.task('stubLogin')
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    calendarPage.headerUsername().contains('S. Itag')
  })

  it('Non CMD User is signed in and no auth role setup', () => {
    cy.task('stubLogin', { username: 'UNKNOWN' })
    cy.task('stubNotificationPreferencesGet', {})
    cy.login()
    const page = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    page.bannerMFA().contains('You need to set up two-factor authentication ')
  })

  it('Auth 2fa user sign in direct access to /login should redirect', () => {
    cy.task('stubLogin', { username: 'AUTH_USER' })
    cy.task('stubNotificationPreferencesGet', {})

    cy.request('/login')
    cy.task('getLoginUrl').then((url: string) => cy.visit(url))

    const calendarPage = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    calendarPage.headerUsername().contains('S. Itag')
  })
})
