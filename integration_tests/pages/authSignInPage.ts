import { expect, type Locator, type Page } from '@playwright/test'

import AbstractPage from './abstractPage'

export default class AuthSignInPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Sign in' })
  }

  static async verifyOnPage(page: Page): Promise<AuthSignInPage> {
    const authSignInPage = new AuthSignInPage(page)
    await expect(authSignInPage.header).toBeVisible()
    return authSignInPage
  }
}
