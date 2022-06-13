import moment from 'moment'
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

  it('Sign out takes user to sign in page', () => {
    cy.task('stubLogin')
    cy.login()
    Page.verifyOnPageTitle(CalendarPage, moment().format('MMMM YYYY'))

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

  it.skip('Token verification failure takes user to sign in page', () => {
    cy.task('stubLogin')
    cy.login()
    Page.verifyOnPageTitle(CalendarPage, moment().format('MMMM YYYY'))
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it.skip('Token verification failure clears user session', () => {
    cy.task('stubLogin')
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment().format('MMMM YYYY'))
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('token', 'Bobby Brown')
    cy.login()

    calendarPage.headerUsername().contains('B. Brown')
  })

  it('User is signed in and header contains name', () => {
    cy.task('stubLogin')
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, moment().format('MMMM YYYY'))
    calendarPage.headerUsername().contains('S. Itag')
  })
})
