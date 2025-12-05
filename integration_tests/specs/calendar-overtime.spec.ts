import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import CalendarPage, { mobileOrDesktopType } from '../pages/calendarPage'
import hmppsAuth from '../mockApis/hmppsAuth'
import notificationService from '../mockApis/notificationService'
import prisonOfficerApi from '../mockApis/prisonOfficerApi'

test.describe('A staff member can view their overtime calendar', () => {
  test.beforeEach(async ({ page }) => {
    await prisonOfficerApi.stubShifts()
    await notificationService.stubNotificationCount()
    await notificationService.stubNotificationPreferencesGet({ preference: 'EMAIL', email: 'me@gmail.com' })
    await hmppsAuth.stubGetMyMfaSettings(false, false, false)

    await login(page)

    const calendarPage = await CalendarPage.verifyOnPage(page)
    await page.goto('/calendar/2020-04-01')
    await calendarPage.previousMonth.click()
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('Viewing the calendar on mobile', () => {
    test.use({ viewport: { width: 350, height: 750 } })
    test('A staff member can view their overtime calendar on mobile', async ({ page }) => {
      const calendarPage = await CalendarPage.verifyOnPage(page, 'March 2020')

      await expect(calendarPage.daySpanDay(7)).toContainText('Saturday 7')
      await expect(calendarPage.daySpanLine(7).nth(0)).toHaveText('Overtime start: 07:30 Activities Duties')
      await expect(calendarPage.daySpanLine(7).nth(1)).toHaveText('Overtime finish: 12:30 Activities Duties')
      await expect(calendarPage.daySpanLine(7).nth(2)).toHaveText('5 hours')
      await expect(calendarPage.daySpanLine(7).nth(3)).toHaveText('TOIL')
      await expect(calendarPage.daySpanLine(7).nth(4)).toHaveText('Start: 12:30')
      await expect(calendarPage.daySpanLine(7).nth(5)).toHaveText('Break: 17:00 - 17:30')
      await expect(calendarPage.daySpanLine(7).nth(6)).toHaveText('Finish: 21:00')
      await expect(calendarPage.daySpanLine(7).nth(7)).toHaveText('8 hours')

      await expect(calendarPage.daySpanDay(20)).toContainText('Friday 20th March Rest Day')
      await expect(calendarPage.daySpanLine(20).nth(0)).toHaveText('Overtime start: 12:30 Constant Watch')
      await expect(calendarPage.daySpanLine(20).nth(1)).toHaveText('Overtime finish: 13:30 Constant Watch')
      await expect(calendarPage.daySpanLine(20).nth(2)).toHaveText('1 hour')

      await expect(calendarPage.daySpanDay(21)).toContainText('Saturday 21st March Holiday')
      await expect(calendarPage.daySpanLine(21).nth(0)).toHaveText('Overtime start: 12:30 Constant Watch')
      await expect(calendarPage.daySpanLine(21).nth(0)).toHaveText('Overtime start: 12:30 Constant Watch')
      await expect(calendarPage.daySpanLine(21).nth(1)).toHaveText('Overtime finish: 13:30 Constant Watch')
      await expect(calendarPage.daySpanLine(21).nth(2)).toHaveText('1 hour')

      await expect(calendarPage.daySpanDay(22)).toContainText('Sunday 22nd March Rest Day')
      await expect(calendarPage.daySpanLine(22).nth(0)).toHaveText('Overtime night shift start: 22:30 Constant Watch')

      await expect(calendarPage.day(23)).toHaveClass(/rest-day/)
      await expect(calendarPage.daySpanDay(23)).toContainText('Monday 23rd March')
      await expect(calendarPage.daySpanDay(23)).not.toContainText('Rest Day')
      await expect(calendarPage.day(23).locator('div').first()).toHaveClass('black-on-white')
      await expect(calendarPage.daySpanLine(23).nth(0)).toHaveText('Overtime night shift finish: 07:30 Constant Watch')
      await expect(calendarPage.daySpanLine(23).nth(1)).toHaveText('9 hours')
      await expect(calendarPage.daySpanLine(23).nth(1)).toHaveClass(/night_finish/)
      await expect(calendarPage.daySpanLine(23).nth(2)).toHaveText('Rest Day')

      await expect(calendarPage.daySpanDay(27)).toContainText('Friday 27th March')
      await expect(calendarPage.daySpanLine(27).nth(0)).toHaveText('Night shift finish: 04:30 Night Duties')
      await expect(calendarPage.daySpanLine(27).nth(1)).toHaveText('9 hours')
      await expect(calendarPage.daySpanLine(27).nth(1)).toHaveClass(/night_finish/)
      await expect(calendarPage.daySpanLine(27).nth(2)).toHaveText('Night shift start: 22:45 Night Duties')
      await expect(calendarPage.daySpanLine(27).nth(2).locator('hr')).toBeVisible()
    })
  })

  test.describe('Viewing the calendar on desktop', () => {
    test.use({ viewport: { width: 1200, height: 750 } })

    test('A staff member can view their overtime calendar on desktop', async ({ page }) => {
      const calendarPage = await CalendarPage.verifyOnPage(page, 'March 2020')

      await expect(calendarPage.daySpanDay(7, mobileOrDesktopType.desktop)).toContainText('Saturday 7')
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(0)).toHaveText(
        'Overtime start: 07:30 Activities Duties',
      )
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(1)).toHaveText(
        'Overtime finish: 12:30 Activities Duties',
      )
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(2)).toHaveText('5 hours')
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(3)).toHaveText('TOIL')
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(4)).toHaveText('Start: 12:30')
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(5)).toHaveText('Break: 17:00 - 17:30')
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(6)).toHaveText('Finish: 21:00')
      await expect(calendarPage.daySpanLine(7, mobileOrDesktopType.desktop).nth(7)).toHaveText('8 hours')

      await expect(calendarPage.daySpanDay(21, mobileOrDesktopType.desktop)).toContainText('Saturday 21st March')
      await expect(calendarPage.daySpanLine(21, mobileOrDesktopType.desktop).nth(0)).toHaveText('Holiday')
      await expect(calendarPage.daySpanLine(21, mobileOrDesktopType.desktop).nth(1)).toHaveText(
        'Overtime start: 12:30 Constant Watch',
      )
      await expect(calendarPage.daySpanLine(21, mobileOrDesktopType.desktop).nth(1)).toHaveText(
        'Overtime start: 12:30 Constant Watch',
      )
      await expect(calendarPage.daySpanLine(21, mobileOrDesktopType.desktop).nth(2)).toHaveText(
        'Overtime finish: 13:30 Constant Watch',
      )
      await expect(calendarPage.daySpanLine(21, mobileOrDesktopType.desktop).nth(3)).toHaveText('1 hour')

      await expect(calendarPage.day(23, mobileOrDesktopType.desktop).locator('div').nth(1)).toHaveClass(/rest-day/)
      await expect(calendarPage.daySpanDay(23, mobileOrDesktopType.desktop)).toContainText('Monday 23rd March')
      await expect(calendarPage.daySpanDay(23, mobileOrDesktopType.desktop)).not.toContainText('Rest Day')
      await expect(calendarPage.daySpanLine(23, mobileOrDesktopType.desktop).nth(0)).toHaveText(
        'Overtime night shift finish: 07:30 Constant Watch',
      )
      await expect(calendarPage.daySpanLine(23, mobileOrDesktopType.desktop).nth(1)).toHaveText('9 hours')
      await expect(calendarPage.daySpanLine(23, mobileOrDesktopType.desktop).nth(1)).toHaveClass(/night_finish/)
      await expect(calendarPage.daySpanLine(23, mobileOrDesktopType.desktop).nth(2)).toHaveText('Rest Day')

      await expect(calendarPage.daySpanDay(27, mobileOrDesktopType.desktop)).toContainText('Friday 27th March')
      await expect(calendarPage.daySpanLine(27, mobileOrDesktopType.desktop).nth(0)).toHaveText(
        'Night shift finish: 04:30 Night Duties',
      )
      await expect(calendarPage.daySpanLine(27, mobileOrDesktopType.desktop).nth(1)).toHaveText('9 hours')
      await expect(calendarPage.daySpanLine(27, mobileOrDesktopType.desktop).nth(1)).toHaveClass(/night_finish/)
      await expect(calendarPage.daySpanLine(27, mobileOrDesktopType.desktop).nth(2)).toHaveText(
        'Night shift start: 22:45 Night Duties',
      )
      await expect(calendarPage.daySpanLine(27, mobileOrDesktopType.desktop).nth(2).locator('hr')).toBeVisible()
    })
  })
})
