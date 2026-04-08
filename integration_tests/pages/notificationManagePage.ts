import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class NotificationManagePage extends AbstractPage {
  readonly header: Locator

  readonly change: Locator

  readonly pause: Locator

  readonly resume: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Manage your notifications' })
    this.change = page.getByRole('link', { name: 'Change' })
    this.pause = page.getByRole('link', { name: 'Pause notifications' })
    this.resume = page.getByRole('button', { name: 'Resume notifications now' })
  }

  static async verifyOnPage(page: Page): Promise<NotificationManagePage> {
    const notificationManagePage = new NotificationManagePage(page)
    await expect(notificationManagePage.header).toBeVisible()
    return notificationManagePage
  }
}
