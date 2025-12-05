import { test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import CalendarPage from '../pages/calendarPage'
import hmppsAuth from '../mockApis/hmppsAuth'
import notificationService from '../mockApis/notificationService'
import prisonOfficerApi from '../mockApis/prisonOfficerApi'
import ContactUsPage from '../pages/contactUsPage'

test.describe('Contact us functionality', () => {
  test.beforeEach(async ({ page }) => {
    await prisonOfficerApi.stubShifts()
    await notificationService.stubNotificationCount()
    await notificationService.stubNotificationPreferencesGet({ preference: 'EMAIL', email: 'me@gmail.com' })
    await hmppsAuth.stubGetMyMfaSettings(true, true, false)
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Link on pages takes user to contact us', async ({ page }) => {
    await CalendarPage.verifyOnPage(page)
    await page.getByRole('link', { name: 'Contact us' }).click()
    await ContactUsPage.verifyOnPage(page)
  })
})
