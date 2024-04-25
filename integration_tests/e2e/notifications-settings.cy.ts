import { addDays, format } from 'date-fns'

import NotificationSettingsPage from '../pages/notificationSettings'
import NotificationManagePage from '../pages/notificationManage'
import Page from '../pages/page'
import NotificationPausePage from '../pages/notificationPause'

context('A staff member can view their notification settings', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: true, emailVerified: true })
    cy.task('stubNotifications')
    cy.task('stubNotificationCount')
    cy.task('stubShifts')
    cy.login()
  })

  it('Notification setting validation with existing email', () => {
    cy.task('stubNotificationPreferencesGet', {
      preference: 'EMAIL',
      email: 'me@gmail.com',
    })
    cy.task('stubNotificationPreferencesSet')

    cy.visit('/notifications/manage')
    Page.verifyOnPage(NotificationManagePage)
    cy.contains('Change').click()
    const page = Page.verifyOnPage(NotificationSettingsPage)

    page.radio('EMAIL').should('be.checked')
    page.checkEmail('me@gmail.com')

    page.inputEmail().clear()
    page.submit()

    page.errorSummary().contains('Email address cannot be blank')
    page.radio('EMAIL').should('be.checked')

    cy.task('stubNotificationPreferencesGet404')
    cy.visit('/notifications/settings')
    page.submit()

    page.errorSummary().contains('Select if you want to receive notifications')

    page.radioLabel('Email').click()
    page.inputEmail().type('address-invalid')
    page.submit()

    page.errorSummary().contains('Enter an email address in the correct format, like name@example.com')

    page.inputEmail().clear().type('address@domain.com')
    page.submit()

    Page.verifyOnPage(NotificationManagePage)
    cy.task('verifyDetails').then(requests => {
      expect(requests).to.have.length(1)
      expect(requests[0].body).eq(`{"preference":"EMAIL","email":"address@domain.com","sms":""}`)
    })
  })

  it('Notification setting validation with existing phone number', () => {
    cy.task('stubNotificationPreferencesGet', {
      preference: 'SMS',
      sms: '07123456789',
    })
    cy.task('stubNotificationPreferencesSet')

    cy.visit('/notifications/manage')
    Page.verifyOnPage(NotificationManagePage)
    cy.contains('Change').click()
    const page = Page.verifyOnPage(NotificationSettingsPage)

    page.radio('SMS').should('be.checked')
    page.checkSMS('07123456789')

    page.inputSMS().clear()
    page.submit()

    page.errorSummary().contains('Phone number cannot be blank')
    page.radio('SMS').should('be.checked')

    cy.task('stubNotificationPreferencesGet404')
    cy.visit('/notifications/settings')
    page.submit()

    page.errorSummary().contains('Select if you want to receive notifications')

    page.radioLabel('Text message').click()
    page.inputSMS().type('0123invalid')
    page.submit()

    page.errorSummary().contains('Enter a mobile phone number in the correct format')

    page.inputSMS().clear().type('07987 654321')
    page.submit()

    Page.verifyOnPage(NotificationManagePage)
    cy.task('verifyDetails').then(requests => {
      expect(requests).to.have.length(1)
      expect(requests[0].body).eq(`{"preference":"SMS","email":"","sms":"07987654321"}`)
    })
  })

  it('Manage your notifications - set and pause', () => {
    cy.task('stubNotificationPreferencesGet', {
      preference: 'EMAIL',
      email: 'me@gmail.com',
    })

    cy.visit('/notifications/manage')
    const page = Page.verifyOnPage(NotificationManagePage)

    cy.contains('You receive notifications')
    page.pause().click()

    const pausePage = Page.verifyOnPage(NotificationPausePage)

    pausePage.submit()
    cy.contains('Enter a number')
    cy.contains('Select a period of time')

    pausePage.pauseValue().type('12')
    pausePage.submit()
    cy.contains('Select a period of time')
    pausePage.pauseValue().should('have.value', '12')

    pausePage.pauseValue().clear()
    pausePage.pauseValue().type('0')
    pausePage.submit()
    cy.contains('Enter a number above 0')
    cy.contains('Select a period of time')
    pausePage.pauseValue().should('have.value', '0')

    pausePage.pauseValue().clear()
    pausePage.pauseUnit().select('Days')
    pausePage.submit()
    cy.contains('Enter a number')
    pausePage.pauseUnitSelected().should('have.text', 'Days')

    pausePage.pauseValue().type('12')
    pausePage.submit()

    Page.verifyOnPage(NotificationManagePage)
    cy.task('verifySnooze').then(requests => {
      expect(requests).to.have.length(1)
      expect(requests[0].body).eq(`{"snoozeUntil":"${addDays(new Date(), 12).toISOString().split('T')[0]}"}`)
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
      snoozeUntil: addDays(new Date(), 3).toISOString().split('T')[0],
      email: 'me@gmail.com',
    })

    cy.visit('/notifications/manage')
    Page.verifyOnPage(NotificationManagePage)

    cy.contains(`Notifications will start again on ${format(addDays(new Date(), 4), 'd MMMM yyyy')}`)
  })
})
