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
    cy.task('stubSignIn')
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Sign in page redirects to the auth sign in page if not signed in', () => {
    cy.task('stubSignIn')
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Login page redirects to the auth sign in page if not signed in', () => {
    cy.task('stubSignIn')
    cy.visit('/login')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Going to old auth pages now redirects to sign in or calendar', () => {
    cy.task('stubSignIn')
    cy.signIn()
    cy.visit('/auth/login')
    Page.verifyOnPageTitle(CalendarPage, 'Your shift detail')
    cy.request({
      method: 'POST',
      url: '/auth/2fa',
      followRedirect: false,
    }).then(resp => {
      expect(resp.status).to.eq(302)
      expect(resp.redirectedToUrl).to.eq('http://localhost:3007/')
    })
  })

  it('Sign out takes user to sign in page', () => {
    cy.task('stubSignIn')
    cy.signIn()
    Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))

    // can't do a visit here as cypress requires only one domain
    cy.request('/sign-out').its('body').should('contain', 'Sign in')
  })

  it('User can sign out', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const indexPage = Page.verifyOnPage(CalendarPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User access to old /logout signs the user out', () => {
    cy.task('stubSignIn')
    cy.signIn()
    Page.verifyOnPage(CalendarPage)
    cy.visit('/logout')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Direct access to login callback takes user to sign in page', () => {
    cy.task('stubSignIn')
    cy.visit('/sign-in/callback')
    Page.verifyOnPage(AuthSignInPage)

    // can't do a visit here as cypress requires only one domain
    cy.task('getSignInUrl').then(cy.request).its('body').should('contain', 'Check my diary')
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.task('stubSignIn')
    cy.signIn()
    Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure clears user session', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('token', { username: 'BBROWN', name: 'Bobby Brown' })
    cy.signIn()

    calendarPage.headerUsername().contains('B. Brown')
  })

  it('User is signed in and header contains name', () => {
    cy.task('stubSignIn')
    cy.signIn()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    calendarPage.headerUsername().contains('S. Itag')
  })

  it('Non CMD User is signed in and no auth role setup', () => {
    cy.task('stubSignIn', { username: 'UNKNOWN' })
    cy.task('stubNotificationPreferencesGet', {})
    cy.signIn()
    const page = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    page.bannerMFA().contains('You need to set up two-factor authentication ')
  })

  it('Auth 2fa user sign in direct access to /login should redirect', () => {
    cy.task('stubSignIn', { username: 'AUTH_USER' })
    cy.task('stubNotificationPreferencesGet', {})

    cy.request('/login')
    cy.task('getSignInUrl').then((url: string) => cy.visit(url))

    const calendarPage = Page.verifyOnPageTitle(CalendarPage, format(new Date(), 'MMMM yyyy'))
    calendarPage.headerUsername().contains('S. Itag')
  })
})
