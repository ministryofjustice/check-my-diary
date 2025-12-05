import { type Locator, type Page } from '@playwright/test'

export default class AbstractPage {
  readonly page: Page

  /** user name that appear in header */
  readonly usersName: Locator

  /** phase banner that appear in header */
  readonly phaseBanner: Locator

  /** link to sign out */
  readonly signoutLink: Locator

  readonly errorSummary: Locator

  readonly changeLocationLink: Locator

  protected constructor(page: Page) {
    this.page = page
    this.phaseBanner = page.getByRole('banner').getByText('DEV')
    this.usersName = page.getByRole('banner').getByTestId('header-user-name')
    this.signoutLink = page.getByRole('banner').getByText('Sign out')
    this.changeLocationLink = page.getByRole('banner').getByTestId('changeCaseLoad')
    this.errorSummary = page.locator('[data-module="govuk-error-summary"]').getByRole('listitem')
  }

  async signOut() {
    await this.signoutLink.first().click()
  }
}
