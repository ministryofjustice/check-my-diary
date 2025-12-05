import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class NotificationSettingsPage extends AbstractPage {
  readonly header: Locator

  readonly email: Locator

  readonly sms: Locator

  readonly emailInput: Locator

  readonly smsInput: Locator

  readonly confirm: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Notification settings' })
    this.email = page.getByRole('radio', { name: 'Email' })
    this.sms = page.getByRole('radio', { name: 'Text message' })
    this.emailInput = page.getByRole('textbox', { name: 'Email address' })
    this.smsInput = page.getByRole('textbox', { name: 'Mobile phone number' })
    this.confirm = page.getByRole('button', { name: 'Confirm' })
  }

  static async verifyOnPage(page: Page): Promise<NotificationSettingsPage> {
    const notificationSettingsPage = new NotificationSettingsPage(page)
    await expect(notificationSettingsPage.header).toBeVisible()
    return notificationSettingsPage
  }
}
