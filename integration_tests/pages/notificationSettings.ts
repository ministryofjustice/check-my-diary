import Page from './page'

export default class NotificationSettingsPage extends Page {
  constructor() {
    super('Notification settings')
  }

  checkText = (text: string) => {
    cy.get('input[name="contactMethod"][value="SMS"]').should('be.checked')
    cy.get('input[name="inputMobile"]').should('have.value', text)
  }
}
