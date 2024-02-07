import CalendarPage from '../pages/calendarPage'
import Page from '../pages/page'
import NotificationSettingsPage from '../pages/notificationSettings'

context('A staff member can view their calendar', () => {
  before(() => {
    cy.viewport(350, 750)
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubShifts')
    cy.task('stubNotificationCount')
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

    calendarPage.dpsLink().should('not.exist')
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

  it('SMS banner is shown and dismissed', () => {
    cy.task('stubLogin')
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)

    calendarPage.bannerSMS().contains('You have the option of receiving shift changes via text or email')
    calendarPage.notificationBannerSmsLink().click()
    Page.verifyOnPage(NotificationSettingsPage)

    cy.visit('/')
    calendarPage.bannerSMS().contains('Dismiss').click()
    calendarPage.bannerSMS().should('not.be.visible')
  })

  it('New user banner is shown and dismissed', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER' })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.bannerMFA().contains('Once signed in, you can change these settings')

    calendarPage.bannerMFA().contains('Dismiss').click()
    calendarPage.bannerSMS().should('be.visible')
    calendarPage.bannerMFA().should('not.be.visible')

    cy.visit('/calendar/2020-03-01')
    Page.verifyOnPageTitle(CalendarPage, 'March 2020')
    calendarPage.bannerSMS().should('exist')
    calendarPage.bannerMFA().should('not.exist')
  })

  it('First time user banner is shown, no role', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER', authorities: [] })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.bannerMFA().contains('You must add a backup personal email address whilst in the establishment')
    calendarPage.bannerMFA().contains('Dismiss').should('not.exist')
  })

  it('Both SMS and MFA banner messages shown', () => {
    cy.task('stubGetMyMfaSettings', { backupVerified: false, mobileVerified: false, emailVerified: true })
    cy.task('stubLogin', { username: 'AUTH_USER' })
    cy.login()
    const calendarPage = Page.verifyOnPageTitle(CalendarPage)
    calendarPage.bannerSMS().contains('You have the option of receiving shift changes via text or email')
    calendarPage.bannerMFA().contains('You must add a backup personal email address whilst in the establishment')
  })

  it('DPS link shown', () => {
    cy.task('stubLogin')
    cy.login()

    cy.visit('/?fromDPS=true')
    const calendarPage = Page.verifyOnPageTitle(CalendarPage, 'Your shift detail')
    calendarPage.dpsLink().contains('Digital Prison Services')

    cy.visit('/')
    // still in session
    calendarPage.dpsLink().contains('Digital Prison Services')
  })
})
