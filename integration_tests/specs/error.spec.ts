import { test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import hmppsAuth from '../mockApis/hmppsAuth'
import notificationService from '../mockApis/notificationService'
import prisonOfficerApi from '../mockApis/prisonOfficerApi'

test.describe('A staff member can view their notifications', () => {
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

  test('Errors are handled by error page', async ({ page }) => {
    await page.goto('/notifications')
    page.getByRole('heading', { name: 'Not Found' })
  })

  test('Auth error page can be rendered', async ({ page }) => {
    await page.goto('/autherror')
    page.getByRole('heading', { name: 'Authorisation Error' })
  })
})
