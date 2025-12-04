import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class NotSignedUpPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'There is a problem' })
  }

  static async verifyOnPage(page: Page): Promise<NotSignedUpPage> {
    const notSignedUpPage = new NotSignedUpPage(page)
    await expect(notSignedUpPage.header).toBeVisible()
    return notSignedUpPage
  }
}
