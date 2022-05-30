import moment from 'moment'
import NotificationSettingsPage from '../pages/notificationSettings'
import NotificationManagePage from '../pages/notificationManage'
import Page from '../pages/page'

context('A staff member can view their notification settings', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubNotifications')
    cy.task('stubNotificationCount')
    cy.task('stubShifts')
    cy.login()
  })

  it('Current notification setting is selected', () => {
    cy.visit('/notifications/settings')
    const page = Page.verifyOnPage(NotificationSettingsPage)

    page.checkText('01189998819991197253')
  })

  it('Manage your notifications - set', () => {
    cy.task('stubNotificationPreferencesGet', {
      preference: 'EMAIL',
      email: 'me@gmail.com',
    })

    cy.visit('/notifications/manage')
    Page.verifyOnPage(NotificationManagePage)

    cy.contains('You receive notifications')
    cy.contains('Pause notifications').click()

    cy.contains('How long do you want to pause notifications for')
    cy.contains('Confirm').click()
    cy.contains('Enter a number')
    cy.contains('Select a period of time')

    cy.get('input[name="pauseValue"]').type('12')
    cy.contains('Confirm').click()
    cy.contains('Select a period of time')
    cy.get('input[name="pauseValue"]').should('have.value', '12')

    cy.get('input[name="pauseValue"]').clear()
    cy.get('select[name="pauseUnit"]').select('Days')
    cy.contains('Confirm').click()
    cy.contains('Enter a number')
    cy.get('select[name="pauseUnit"] option:selected').should('have.text', 'Days')

    cy.get('input[name="pauseValue"]').type('12')
    cy.contains('Confirm').click()

    Page.verifyOnPage(NotificationManagePage)
    cy.task('verifySnooze').then((requests) => {
      expect(requests).to.have.length(1)
      expect(requests[0].body).eq(`{"snoozeUntil":"${moment().add(12, 'days').format('YYYY-MM-DD')}"}`)
    })
  })

  it('Manage your notifications - not set', () => {
    cy.task('stubNotificationPreferencesGet', { preference: 'NONE' })

    cy.visit('/notifications/manage')
    Page.verifyOnPage(NotificationManagePage)

    cy.contains('You do not receive notifications')
  })

  it('Manage your notifications - paused', () => {
    cy.task('stubNotificationPreferencesGet', {
      preference: 'EMAIL',
      snoozeUntil: moment().add(3, 'days').format('YYYY-MM-DD'),
      email: 'me@gmail.com',
    })

    cy.visit('/notifications/manage')
    Page.verifyOnPage(NotificationManagePage)

    cy.contains(`Notifications will start again on ${moment().add(4, 'days').format('D MMMM YYYY')}`)
  })
})
