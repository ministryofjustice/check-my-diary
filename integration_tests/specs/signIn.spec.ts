import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import CalendarPage from '../pages/calendarPage'
import hmppsAuth from '../mockApis/hmppsAuth'
import notificationService from '../mockApis/notificationService'
import prisonOfficerApi from '../mockApis/prisonOfficerApi'

test.describe('SignIn', () => {
  test.beforeEach(async () => {
    await prisonOfficerApi.stubShifts()
    await notificationService.stubNotificationCount()
    await notificationService.stubNotificationPreferencesGet({ preference: 'EMAIL', email: 'me@gmail.com' })
    await hmppsAuth.stubGetMyMfaSettings(false, false, false)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Unauthenticated user navigating to sign in page directed to auth', async ({ page }) => {
    await hmppsAuth.stubSignInPage()
    await page.goto('/sign-in')

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Going to old auth pages now redirects to sign in or calendar', async ({ page }) => {
    await login(page)
    await page.goto('/auth/login')
    await CalendarPage.verifyOnPage(page, 'Your shift detail')

    await page.goto('/auth/2fa')
    await CalendarPage.verifyOnPage(page, 'Your shift detail')
  })

  test('User name visible in header', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    const calendarPage = await CalendarPage.verifyOnPage(page)

    await expect(calendarPage.usersName).toHaveText('A. Testuser')
  })

  test('Phase banner visible in header', async ({ page }) => {
    await login(page)

    const calendarPage = await CalendarPage.verifyOnPage(page)

    await expect(calendarPage.phaseBanner).toHaveText('dev')
  })

  test('User can sign out', async ({ page }) => {
    await login(page)

    const calendarPage = await CalendarPage.verifyOnPage(page)
    await calendarPage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User access to old /logout signs the user out', async ({ page }) => {
    await login(page)

    await CalendarPage.verifyOnPage(page)

    await page.goto('/logout')
    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Token verification failure takes user to sign in page', async ({ page }) => {
    await login(page, { active: false })

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('Non CMD User is signed in and no auth role setup', async ({ page }) => {
    hmppsAuth.stubSignInPage()
    notificationService.stubNotificationPreferencesGet({})

    await login(page)
    const calendarPage = await CalendarPage.verifyOnPage(page)
    await expect(calendarPage.bannerMFA).toContainText('You need to set up two-factor authentication ')
  })
})
