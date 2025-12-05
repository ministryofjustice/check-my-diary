import { Cookie, expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import CalendarPage from '../pages/calendarPage'
import hmppsAuth from '../mockApis/hmppsAuth'
import notificationService from '../mockApis/notificationService'
import prisonOfficerApi from '../mockApis/prisonOfficerApi'
import NotificationSettingsPage from '../pages/notificationSettingsPage'

const justUnderAYear = new Date()
// we allow 4 days either side to account for leap years etc
justUnderAYear.setFullYear(justUnderAYear.getFullYear() + 1, justUnderAYear.getMonth(), justUnderAYear.getDate() - 4)
const justOverAYear = new Date()
justOverAYear.setFullYear(justOverAYear.getFullYear() + 1, justOverAYear.getMonth(), justOverAYear.getDate() + 4)

test.describe('A staff member can view their calendar', () => {
  test.use({ viewport: { width: 350, height: 750 } })

  test.beforeEach(async () => {
    await prisonOfficerApi.stubShifts()
    await notificationService.stubNotificationCount()
    await notificationService.stubNotificationPreferencesGet({ preference: 'EMAIL', email: 'me@gmail.com' })
    await hmppsAuth.stubGetMyMfaSettings(false, false, false)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('Viewing the calendar', () => {
    test('A staff member can view their calendar', async ({ page }) => {
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)
      await page.goto('/calendar/2020-05-01')
      await calendarPage.previousMonth.click()
      await calendarPage.previousMonth.click()

      await CalendarPage.verifyOnPage(page, 'March 2020')

      await expect(calendarPage.daySpanDay(1)).toContainText('Rest Day')
      await expect(calendarPage.daySpanLine(1)).toBeHidden()

      await expect(calendarPage.daySpanDay(2)).toContainText('Sick')
      await expect(calendarPage.daySpanLine(2)).toBeHidden()

      await expect(calendarPage.daySpanLine(5).nth(0)).toHaveText('Start: 07:30 Duty Manager')
      await expect(calendarPage.daySpanLine(5).nth(1)).toHaveText('Break: 12:30 - 13:30')
      await expect(calendarPage.daySpanLine(5).nth(2)).toHaveText('Finish: 17:30 Duty Manager')
      await expect(calendarPage.daySpanLine(5).nth(3)).toHaveText('9 hours')

      await expect(calendarPage.daySpanLine(6).nth(1)).toHaveText('Start: 07:45')
      await expect(calendarPage.daySpanLine(6).nth(1)).not.toHaveText('Training - Internal')
      await expect(calendarPage.daySpanLine(6).nth(2)).toHaveText('Finish: 19:30')
      await expect(calendarPage.daySpanLine(6).nth(3)).toHaveText('10 hours 15 minutes')

      await expect(calendarPage.day(10)).toHaveClass(/holiday/)
      await expect(calendarPage.daySpanDay(10)).toContainText('Annual Leave')
      await expect(calendarPage.daySpanLine(10).nth(0)).toHaveText('Start: 07:30')
      await expect(calendarPage.daySpanLine(10).nth(0)).not.toHaveClass('span.line-right')
      await expect(calendarPage.daySpanLine(10).nth(1)).toHaveText('Break: 12:30 - 13:30')
      await expect(calendarPage.daySpanLine(10).nth(2)).toHaveText('Finish: 17:30')
      await expect(calendarPage.daySpanLine(10).nth(3)).toHaveText('9 hours')

      await expect(calendarPage.dpsLink).toBeHidden()
    })

    test('A staff member can see a day shift', async ({ page }) => {
      await login(page)

      await page.goto('/calendar/2020-03-01')
      const calendarPage = await CalendarPage.verifyOnPage(page, 'March 2020')

      await expect(calendarPage.day(17).locator('span.day_start').nth(0)).toHaveText('Start: 07:30 Orderly Officer (1)')
      await expect(calendarPage.day(17).locator('span.day_finish').nth(0)).toHaveText(
        'Finish: 12:45 Orderly Officer (1)',
      )
    })

    test('A staff member can see a night shift', async ({ page }) => {
      await login(page)

      await page.goto('/calendar/2020-03-01')
      const calendarPage = await CalendarPage.verifyOnPage(page, 'March 2020')

      await expect(calendarPage.day(26).locator('span.day_finish').nth(0)).toHaveText('Finish: 12:30 Duty Manager')
      await expect(calendarPage.day(26).locator('span.night_start').nth(0)).toHaveText(
        'Night shift start: 22:30 Night Duties',
      )
    })
  })

  test.describe('SMS Banner', () => {
    test('SMS banner is shown and dismissed', async ({ page }) => {
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)

      await expect(calendarPage.bannerSMS).toContainText(
        'You have the option of receiving shift changes via text or email',
      )
      await calendarPage.bannerSMS.getByTestId('banner-sms-notification-link').click()
      await NotificationSettingsPage.verifyOnPage(page)

      await page.goto('/')
      await calendarPage.bannerSMS.getByRole('link', { name: 'Dismiss' }).click()
      await expect(calendarPage.bannerSMS).toBeHidden()
    })

    test('SMS banner dismissal should last for about a year', async ({ page }) => {
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)

      await expect(calendarPage.bannerSMS).toContainText(
        'You have the option of receiving shift changes via text or email',
      )
      await calendarPage.bannerSMS.getByTestId('banner-sms-notification-link').click()
      await NotificationSettingsPage.verifyOnPage(page)

      await page.goto('/')
      await calendarPage.bannerSMS.getByRole('link', { name: 'Dismiss' }).click()
      await expect(calendarPage.bannerSMS).toBeHidden()

      const notificationCookie = (await page.context().cookies()).find(
        (cookie: Cookie) => cookie.name === 'ui-notification-banner-SMS_BANNER',
      )
      expect(notificationCookie).toBeDefined()
      expect(notificationCookie?.expires).toBeGreaterThan(justUnderAYear.getTime() / 1000)
      expect(notificationCookie?.expires).toBeLessThan(justOverAYear.getTime() / 1000)
    })
  })

  test.describe('New User banner', () => {
    test('New user banner is shown and dismissed', async ({ page }) => {
      await hmppsAuth.stubGetMyMfaSettings(true, false, true)
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)
      await expect(calendarPage.bannerMFA).toContainText('Once signed in, you can change these settings')

      await calendarPage.bannerMFA.getByRole('link', { name: 'Dismiss' }).click()
      await expect(calendarPage.bannerSMS).toBeVisible()
      await expect(calendarPage.bannerMFA).toBeHidden()

      await page.goto('/calendar/2020-03-01')
      await CalendarPage.verifyOnPage(page, 'March 2020')
      await expect(calendarPage.bannerSMS).toBeVisible()
      await expect(calendarPage.bannerMFA).toBeHidden()
    })

    test('New user banner dismissal should last for about a year', async ({ page }) => {
      await hmppsAuth.stubGetMyMfaSettings(true, false, true)
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)
      await expect(calendarPage.bannerMFA).toContainText('Once signed in, you can change these settings')

      await calendarPage.bannerMFA.getByRole('link', { name: 'Dismiss' }).click()
      await expect(calendarPage.bannerMFA).toBeHidden()

      const notificationCookie = (await page.context().cookies()).find(
        (cookie: Cookie) => cookie.name === 'ui-notification-banner-NEW_USER',
      )
      expect(notificationCookie).toBeDefined()
      expect(notificationCookie?.expires).toBeGreaterThan(justUnderAYear.getTime() / 1000)
      expect(notificationCookie?.expires).toBeLessThan(justOverAYear.getTime() / 1000)
    })

    test('New user banner not shown if existing user banner already dismissed', async ({ page }) => {
      await hmppsAuth.stubGetMyMfaSettings(true, false, true)
      await page
        .context()
        .addCookies([
          { name: 'ui-notification-banner-EXISTING_USER', value: 'dismissed', domain: 'localhost', path: '/' },
        ])
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)
      await expect(calendarPage.bannerMFA).toBeHidden()
    })

    test('First time user banner is shown, no role', async ({ page }) => {
      await hmppsAuth.stubGetMyMfaSettings(false, false, true)
      await login(page)

      const calendarPage = await CalendarPage.verifyOnPage(page)
      await expect(calendarPage.bannerMFA).toContainText(
        'You must add a backup personal email address whilst in the establishment',
      )
      await expect(calendarPage.bannerMFA.getByRole('link', { name: 'Dismiss' })).toBeHidden()
    })
  })

  test('Both SMS and MFA banner messages shown', async ({ page }) => {
    await hmppsAuth.stubGetMyMfaSettings(false, false, true)
    await login(page)

    const calendarPage = await CalendarPage.verifyOnPage(page)
    await expect(calendarPage.bannerSMS).toContainText(
      'You have the option of receiving shift changes via text or email',
    )
    await expect(calendarPage.bannerMFA).toContainText(
      'You must add a backup personal email address whilst in the establishment',
    )
  })

  test('DPS link shown', async ({ page }) => {
    await login(page)

    await page.goto('/?fromDPS=true')
    const calendarPage = await CalendarPage.verifyOnPage(page, 'Your shift detail')
    await expect(calendarPage.dpsLink).toBeVisible()

    await page.goto('/')
    await expect(calendarPage.dpsLink).toBeVisible()
  })
})
