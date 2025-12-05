import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class NotificationPausePage extends AbstractPage {
  readonly header: Locator

  readonly confirm: Locator

  readonly pauseValue: Locator

  readonly pauseUnit: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'How long do you want to pause notifications for' })
    this.confirm = page.getByRole('button', { name: 'Confirm' })
    this.pauseValue = page.getByRole('textbox', { name: 'Enter a number' })
    this.pauseUnit = page.getByLabel('Select a period of time')
  }

  static async verifyOnPage(page: Page): Promise<NotificationPausePage> {
    const notificationPausePage = new NotificationPausePage(page)
    await expect(notificationPausePage.header).toBeVisible()
    return notificationPausePage
  }
}

// pauseValue = (): PageElement => cy.get('input[name="pauseValue"]')
//
// pauseUnit = (): PageElement => cy.get('select[name="pauseUnit"]')
//
// pauseUnitSelected = (): PageElement => cy.get('select[name="pauseUnit"] option:selected')
//
// submit = (): PageElement => cy.contains('Confirm').click()
