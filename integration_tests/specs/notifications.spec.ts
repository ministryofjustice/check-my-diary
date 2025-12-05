import { expect, test } from '@playwright/test'

import prisonOfficerApi from '../mockApis/prisonOfficerApi'
import notificationService from '../mockApis/notificationService'
import hmppsAuth from '../mockApis/hmppsAuth'
import { login, resetStubs } from '../testUtils'
import NotificationPage from '../pages/notificationPage'
import NotificationManagePage from '../pages/notificationManagePage'

test.describe('A staff member can view their notifications', () => {
  test.beforeEach(async ({ page }) => {
    await prisonOfficerApi.stubShifts()
    await notificationService.stubNotificationCount()
    await notificationService.stubNotificationPreferencesGet({ preference: 'EMAIL', email: 'me@gmail.com' })
    await notificationService.stubNotificationGet()
    await hmppsAuth.stubGetMyMfaSettings(true, true, true)

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Notification page is visible', async ({ page }) => {
    await page.goto('/notifications')
    const notificationsPage = await NotificationPage.verifyOnPage(page)
    await notificationsPage.manage.click()
    await NotificationManagePage.verifyOnPage(page)
    await expect(page.getByText('You can be notified by email')).toBeVisible()
  })

  test('Notification page shows no notifications', async ({ page }) => {
    await notificationService.stubNotificationGet([])
    await page.goto('/notifications')
    const notificationsPage = await NotificationPage.verifyOnPage(page)

    await expect(notificationsPage.summary).toContainText('There are no notifications')
  })

  test('Notifications are visible', async ({ page }) => {
    await page.goto('/notifications')

    const notificationPage = await NotificationPage.verifyOnPage(page)
    await expect(notificationPage.notification('8 hours ago')).toContainText('has changed to [Paternity Leave]')
    await expect(notificationPage.notification('4 days ago')).toContainText('has changed to [FMI Training]')
    await expect(notificationPage.notification('2 months ago')).toContainText('has changed to [Late Roll (OSG)]')
    await expect(notificationPage.notification('3 years ago')).toContainText('has changed to [FMI Training]')
  })

  test('Notifications banner is visible', async ({ page }) => {
    await notificationService.stubNotificationPreferencesGet()
    await page.goto('/notifications')
    const notificationsPage = await NotificationPage.verifyOnPage(page)
    await notificationsPage.manage.click()

    await NotificationManagePage.verifyOnPage(page)
    await expect(page.getByText('You have paused')).toHaveText('You have paused your notifications.')
    await expect(page.getByRole('button', { name: 'Resume notifications now' })).toBeVisible()
  })
})
