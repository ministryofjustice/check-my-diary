import CalendarPage from '../pages/calendarPage'
import Page from '../pages/page'
import NotificationSettingsPage from '../pages/notificationSettings'

context('A staff member can view their calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
    cy.viewport(350, 750)
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

    calendarPage.day(1).within(() => {
      cy.get('span.day').contains('Rest Day')
      cy.get('span.line').should('not.exist')
    })

    calendarPage.day(2).within(() => {
      cy.get('span.day').contains('Sick')
      cy.get('span.line').should('not.exist')
    })

    calendarPage.day(5).within(() => {
      cy.get('span.line').eq(0).contains('Start: 07:30')
      cy.get('span.line').eq(0).contains('Duty Manager')
      cy.get('span.line').eq(1).contains('Break: 12:30 - 13:30')
      cy.get('span.line').eq(2).contains('Finish: 17:30')
      cy.get('span.line').eq(2).contains('Duty Manager')
      cy.get('span.line').eq(3).contains('9 hours')
    })

    calendarPage.day(6).within(() => {
      cy.get('span.line').eq(0).contains('Training - Internal')
      cy.get('span.line').eq(1).contains('Start: 07:45')
      cy.get('span.line').eq(1).should('not.contain', 'Training - Internal')
      cy.get('span.line').eq(2).contains('Finish: 19:30')
      cy.get('span.line').eq(3).contains('10 hours 15 minutes')
    })

    calendarPage.shouldHaveClass(calendarPage.day(10), 'holiday')

    calendarPage.day(10).within(() => {
      cy.get('span.day').contains('Annual Leave')
      cy.get('span.line')
        .eq(0)
        .within(() => {
          cy.contains('Start: 07:30')
          cy.get('span.line-right').should('not.exist')
        })
      cy.get('span.line').eq(1).contains('Break: 12:30 - 13:30')
      cy.get('span.line').eq(2).contains('Finish: 17:30')
      cy.get('span.line').eq(3).contains('9 hours')
    })
  })

  it('A staff member can see a day shift', () => {
    cy.task('stubLogin')
    cy.login()

    cy.visit('/calendar/2020-03-01')
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    calendarPage.detailStart(17).should('contain', 'Start: 07:30')
    calendarPage.detailFinish(17).should('contain.text', 'Finish: 12:45')
  })

  it('A staff member can see a night shift', () => {
    cy.task('stubLogin')
    cy.login()

    cy.visit('/calendar/2020-03-01')
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'March 2020')

    calendarPage.detailFinish(26).should('contain.text', 'Finish: 12:30')
    calendarPage.detailStartNight(26).should('contain', 'Night shift start: 22:30').should('contain', 'Night Duties')
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

  it('First time user banner is shown, no role', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER', authorities: [] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().contains('You must add a backup personal email address or phone number')
    calendarPage.banner().contains('Dismiss').should('not.exist')
  })

  it('Both SMS and MFA banner messages shown', () => {
    cy.task('stubNotificationPreferencesGet', { preference: 'SMS', sms: '01234567890' })
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER', authorities: ['ROLE_CMD_MIGRATED_MFA'] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.banner().contains('You will soon only be able to receive notifications by email')
    calendarPage.banner().contains('You must add a backup personal email address or phone number')
  })
})
