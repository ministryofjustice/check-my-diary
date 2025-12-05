import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class ContactUsPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Contact us' })
  }

  static async verifyOnPage(page: Page): Promise<ContactUsPage> {
    const contactUsPage = new ContactUsPage(page)
    await expect(contactUsPage.header).toBeVisible()
    return contactUsPage
  }
}
