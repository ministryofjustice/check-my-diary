import Page, { PageElement } from './page'

export default class NotificationSettingsPage extends Page {
  constructor() {
    super('Do you want to receive notifications')
  }

  errorSummary = (): PageElement => cy.get('.govuk-error-summary')

  checkText = (text: string) => {
    this.inputEmail().should('have.value', text)
  }

  radio = (text: string) => cy.get(`input[name="notificationRequired"][value="${text}"]`)

  inputEmail = (): PageElement => cy.get('input[name="inputEmail"]')

  submit = (): PageElement => cy.contains('Confirm').click()
}
