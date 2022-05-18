import NotificationSettingsPage from '../pages/notificationSettings'
import Page from '../pages/page'

context('A staff member can view their notification settings', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubNotifications')
    cy.task('stubNotificationCount')
    cy.task('stubShifts')
    cy.login()

    cy.visit('/notifications/settings')
  })

  it('Notification page is visible', () => {
    Page.verifyOnPage(NotificationSettingsPage)
  })

  it('Current notification setting is selected', () => {
    const page = Page.verifyOnPage(NotificationSettingsPage)

    page.checkText('01189998819991197253')
  })
})
