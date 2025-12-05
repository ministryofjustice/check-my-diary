import { expect, test } from '@playwright/test'
import { addDays, format } from 'date-fns'

import prisonOfficerApi from '../mockApis/prisonOfficerApi'
import notificationService from '../mockApis/notificationService'
import hmppsAuth from '../mockApis/hmppsAuth'
import { login, resetStubs } from '../testUtils'
import NotificationManagePage from '../pages/notificationManagePage'
import NotificationSettingsPage from '../pages/notificationSettingsPage'
import NotificationPausePage from '../pages/notificationPausePage'

test.describe('A staff member can view their notification settings', () => {
  test.beforeEach(async ({ page }) => {
    await prisonOfficerApi.stubShifts()
    await notificationService.stubNotificationCount()
    await notificationService.stubNotificationPreferencesGet()
    await notificationService.stubNotificationGet()
    await hmppsAuth.stubGetMyMfaSettings(true, true, true)

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Notification setting validation with existing email', async ({ page }) => {
    await notificationService.stubNotificationPreferencesGet({ preference: 'EMAIL', email: 'me@gmail.com' })
    await notificationService.stubNotificationPreferencesSet()

    await page.goto('/notifications/manage')
    const managePage = await NotificationManagePage.verifyOnPage(page)
    await managePage.change.click()
    const settingsPage = await NotificationSettingsPage.verifyOnPage(page)

    await expect(settingsPage.email).toBeChecked()
    await expect(settingsPage.emailInput).toHaveValue('me@gmail.com')

    await settingsPage.emailInput.clear()
    await settingsPage.confirm.click()

    await expect(settingsPage.errorSummary).toHaveText('Email address cannot be blank')
    await expect(settingsPage.email).toBeChecked()

    await notificationService.stubNotificationPreferencesGet404()
    await page.goto('/notifications/settings')
    await settingsPage.confirm.click()

    await expect(settingsPage.errorSummary).toHaveText('Select if you want to receive notifications')

    await settingsPage.email.check()
    await settingsPage.emailInput.fill('address-invalid')
    await settingsPage.confirm.click()

    await expect(settingsPage.errorSummary).toHaveText(
      'Enter an email address in the correct format, like name@example.com',
    )

    await settingsPage.emailInput.clear()
    await settingsPage.emailInput.fill('address@domain.com')
    await settingsPage.confirm.click()

    await NotificationManagePage.verifyOnPage(page)
    const requests = await notificationService.verifyDetails()
    expect(requests[0]?.body).toEqual(`{"preference":"EMAIL","email":"address@domain.com","sms":""}`)
    expect(requests.length).toEqual(1)
  })

  test('Notification setting validation with existing phone number', async ({ page }) => {
    await notificationService.stubNotificationPreferencesGet({
      preference: 'SMS',
      sms: '07123456789',
    })
    await notificationService.stubNotificationPreferencesSet()

    await page.goto('/notifications/manage')
    const managePage = await NotificationManagePage.verifyOnPage(page)
    await managePage.change.click()
    const settingsPage = await NotificationSettingsPage.verifyOnPage(page)

    await expect(settingsPage.sms).toBeChecked()
    await expect(settingsPage.smsInput).toHaveValue('07123456789')

    await settingsPage.smsInput.clear()
    await settingsPage.confirm.click()

    await expect(settingsPage.errorSummary).toHaveText('Phone number cannot be blank')
    await expect(settingsPage.sms).toBeChecked()

    await notificationService.stubNotificationPreferencesGet404()
    await page.goto('/notifications/settings')
    await settingsPage.confirm.click()

    await expect(settingsPage.errorSummary).toHaveText('Select if you want to receive notifications')

    await settingsPage.sms.check()
    await settingsPage.smsInput.fill('0123invalid')
    await settingsPage.confirm.click()

    await expect(settingsPage.errorSummary).toHaveText('Enter a mobile phone number in the correct format')

    await settingsPage.smsInput.fill('07987 654321')
    await settingsPage.confirm.click()

    await NotificationManagePage.verifyOnPage(page)
    const requests = await notificationService.verifyDetails()
    expect(requests[0]?.body).toEqual(`{"preference":"SMS","email":"","sms":"07987654321"}`)
    expect(requests.length).toEqual(1)
  })

  test('Manage your notifications - set and pause', async ({ page }) => {
    await notificationService.stubNotificationPreferencesGet({
      preference: 'EMAIL',
      email: 'me@gmail.com',
    })

    await page.goto('/notifications/manage')
    const managePage = await NotificationManagePage.verifyOnPage(page)

    await expect(page.getByText('You receive notifications.')).toBeVisible()
    await managePage.pause.click()

    const pausePage = await NotificationPausePage.verifyOnPage(page)
    await pausePage.confirm.click()

    await expect(pausePage.errorSummary.nth(0)).toHaveText('Enter a number')
    await expect(pausePage.errorSummary.nth(1)).toHaveText('Select a period of time')

    await pausePage.pauseValue.fill('12')
    await pausePage.confirm.click()

    await expect(pausePage.errorSummary).toHaveText('Select a period of time')
    await expect(pausePage.pauseValue).toHaveValue('12')

    await pausePage.pauseValue.clear()
    await pausePage.pauseValue.fill('0')
    await pausePage.confirm.click()

    await expect(pausePage.errorSummary.nth(0)).toHaveText('Enter a number above 0')
    await expect(pausePage.errorSummary.nth(1)).toHaveText('Select a period of time')
    await expect(pausePage.pauseValue).toHaveValue('0')

    await pausePage.pauseValue.clear()
    await pausePage.pauseUnit.selectOption('Days')
    await pausePage.confirm.click()

    await expect(pausePage.errorSummary).toHaveText('Enter a number')
    await expect(pausePage.pauseUnit).toHaveValue('days')

    await pausePage.pauseValue.fill('12')
    await notificationService.stubNotificationUpdate()
    await pausePage.confirm.click()

    await NotificationManagePage.verifyOnPage(page)

    const requests = await notificationService.verifySnooze()
    expect(requests[0]?.body).toEqual(`{"snoozeUntil":"${addDays(new Date(), 12).toISOString().split('T')[0]}"}`)
    expect(requests.length).toEqual(1)
  })

  test('Manage your notifications - not set', async ({ page }) => {
    await notificationService.stubNotificationPreferencesGet({ preference: 'NONE' })

    await page.goto('/notifications/manage')
    await NotificationManagePage.verifyOnPage(page)

    await expect(page.getByText('You do not receive')).toContainText('You do not receive notifications')
  })

  test('Manage your notifications - paused', async ({ page }) => {
    await notificationService.stubNotificationPreferencesGet({
      preference: 'EMAIL',
      snoozeUntil: addDays(new Date(), 3).toISOString().split('T')[0],
      email: 'me@gmail.com',
    })

    await page.goto('/notifications/manage')
    await NotificationManagePage.verifyOnPage(page)

    await expect(page.getByText('Notifications will start')).toContainText(
      `Notifications will start again on ${format(addDays(new Date(), 4), 'd MMMM yyyy')}`,
    )
  })
})
