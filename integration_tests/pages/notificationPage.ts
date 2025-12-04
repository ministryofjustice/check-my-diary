import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class NotificationPage extends AbstractPage {
  readonly header: Locator

  readonly manage: Locator

  readonly summary: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Your notifications' })
    this.manage = page.getByRole('link', { name: 'Manage your notifications' })
    this.summary = page.getByTestId('summary-message')
  }

  static async verifyOnPage(page: Page): Promise<NotificationPage> {
    const notificationPage = new NotificationPage(page)
    await expect(notificationPage.header).toBeVisible()
    return notificationPage
  }

  notification = (ago: string): Locator =>
    this.page.getByRole('listitem').filter({ hasText: ago }).getByRole('paragraph')
}
