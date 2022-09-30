import Page, { PageElement } from './page'

export default class NotificationSettingsPage extends Page {
  constructor() {
    super('Notification settings')
  }

  checkEmail = (text: string) => {
    this.inputEmail().should('have.value', text)
  }

  checkSMS = (text: string) => {
    this.inputSMS().should('have.value', text)
  }

  radio = (text: string) => cy.get(`input[name="contactMethod"][value="${text}"]`)

  inputEmail = (): PageElement => cy.get('input[name="inputEmail"]')

  inputSMS = (): PageElement => cy.get('input[name="inputSMS"]')

  submit = (): PageElement => cy.contains('Confirm').click()
}
