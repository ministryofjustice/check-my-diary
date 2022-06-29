import CalendarPage from '../pages/calendarPage'
import CalendarDetailPage from '../pages/calendarDetailPage'
import Page from '../pages/page'
import NotificationSettingsPage from '../pages/notificationSettings'

context('A staff member can view their calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubNotificationPreferencesGet', { preference: 'EMAIL', email: 'me@gmail.com' })
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: false })
  })

  it('A staff member can view their calendar', () => {
    cy.task('stubLogin')
    cy.login()

    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    cy.visit('/calendar/2020-05-01')
    calendarPage.previousMonth().click()
    calendarPage.previousMonth().click()

    Page.verifyOnPageTitle(CalendarPage, 'March 2020')

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
    cy.task('stubLogin')
    cy.login()

    cy.visit('/calendar/2020-03-01')
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    const dayShift = calendarPage.day('2020-03-06')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 6th March 2020')
    calendarDetailPage.detailStart().should('contain', 'Start of shift').should('contain', 'Training - Internal')
    calendarDetailPage.detailFinish().should('contain.text', 'End of shift')
  })

  it('A staff member can drill into a night shift', () => {
    cy.task('stubLogin')
    cy.login()

    cy.visit('/calendar/2020-03-01')
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    const nightShift = calendarPage.day('2020-03-26')
    nightShift.click({ force: true })

    // the title comes from the seed data, hence the jumping between dates
    const nightShiftPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Thursday, 26th March 2020')
    nightShiftPage.detailFinish().should('contain.text', 'End of shift')
    nightShiftPage.detailStartNight().should('contain', 'Start of night shift').should('contain', 'Night Duties')
  })

  it('A staff member navigates to different days', () => {
    cy.task('stubLogin')
    cy.login()

    cy.visit('/calendar/2020-03-01')
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    const dayShift = calendarPage.day('2020-03-06')
    dayShift.click({ force: true })

    const calendarDetailPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 6th March 2020')
    calendarDetailPage.nextDay().should('contain.text', 'Saturday, 7th').click()
    // the title comes from the seed data, hence the jumping between dates
    const nightShiftPage = Page.verifyOnPageTitle(CalendarDetailPage, 'Saturday, 7th March 2020')
    nightShiftPage.previousDay().should('contain.text', 'Friday, 6th').click()

    Page.verifyOnPageTitle(CalendarDetailPage, 'Friday, 6th March 2020')
  })

  it('Warning banner is shown for sms users but not otherwise', () => {
    cy.task('stubLogin')
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().should('not.exist')
    cy.task('stubNotificationPreferencesGet', { preference: 'SMS', sms: '01234567890' })
    cy.visit('/')

    calendarPage.banner().contains('You will soon only be able to receive notifications by email')
    calendarPage.banner().contains('Dismiss').should('not.exist')
    calendarPage.notificationBannerLink().click()
    Page.verifyOnPage(NotificationSettingsPage)

    cy.task('stubNotificationPreferencesGet', { preference: 'NONE' })
    cy.visit('/')
    calendarPage.banner().should('not.exist')
  })

  it('Existing user banner is shown and dismissed', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: true, emailVerified: true })
    cy.task('stubLogin', { username: 'ITAG_USER', authorities: ['ROLE_CMD_MIGRATED_MFA'] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().contains('You no longer need to contact the support team to change these settings')
    calendarPage.banner().contains('Dismiss').click()
    calendarPage.banner().should('not.be.visible')

    cy.visit('/calendar/2020-03-01')
    Page.verifyOnPageTitle(CalendarPage, 'March 2020')
    calendarPage.banner().should('not.exist')
  })

  it('New user banner is shown and dismissed', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER', authorities: ['ROLE_CMD_MIGRATED_MFA'] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().contains('Once signed in, you can change these settings')

    calendarPage.banner().contains('Dismiss').click()
    calendarPage.banner().should('not.be.visible')

    cy.visit('/calendar/2020-03-01')
    Page.verifyOnPageTitle(CalendarPage, 'March 2020')
    calendarPage.banner().should('not.exist')
  })

  it('First time user banner is shown', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER', authorities: ['ROLE_CMD_MIGRATED_MFA'] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().contains('You must add a backup personal email address or phone number')
    calendarPage.banner().contains('Dismiss').should('not.exist')
  })

  it('Both SMS and MFA banner messages shown', () => {
    cy.task('stubNotificationPreferencesGet', { preference: 'SMS', sms: '01234567890' })
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER', authorities: ['ROLE_CMD_MIGRATED_MFA'] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().contains('You can manage your two-factor authentication settings')
    calendarPage.banner().contains('You will soon only be able to receive notifications by email')
  })
})
