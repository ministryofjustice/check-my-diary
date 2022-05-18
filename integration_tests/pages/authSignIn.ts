import Page from './page'

export default class AuthSignInPage extends Page {
  constructor() {
    super('Sign in')
  }

  checkOnPage() {
    cy.url().should('include', 'authorize')
    super.checkOnPage()
  }
}
