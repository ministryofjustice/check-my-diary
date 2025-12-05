import { expect, type Locator, type Page } from '@playwright/test'
import { format } from 'date-fns'

import AbstractPage from './abstractPage'

export enum mobileOrDesktopType {
  mobile = 'm',
  desktop = 'd',
}

export default class CalendarPage extends AbstractPage {
  readonly header: Locator

  readonly bannerSMS: Locator

  readonly bannerMFA: Locator

  readonly previousMonth: Locator

  readonly dpsLink: Locator

  private constructor(page: Page, date: string) {
    super(page)
    this.header = page.locator('h1', { hasText: date })
    this.bannerSMS = page.locator('#banner-sms')
    this.bannerMFA = page.locator('#banner-mfa')
    this.previousMonth = page.getByTestId('previous')
    this.dpsLink = page.getByRole('link', { name: 'Digital Prison Services' })
  }

  static async verifyOnPage(page: Page, date?: string): Promise<CalendarPage> {
    const calendarPage = new CalendarPage(page, date || format(new Date(), 'MMMM yyyy'))
    await expect(calendarPage.header).toBeVisible()
    return calendarPage
  }

  day = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): Locator =>
    this.page.getByTestId(`${mobileOrDesktop}${date}`)

  daySpanLine = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): Locator =>
    this.page.getByTestId(`${mobileOrDesktop}${date}`).locator('span.line')

  daySpanDay = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): Locator =>
    this.page.getByTestId(`${mobileOrDesktop}${date}`).locator('span.day')
}
