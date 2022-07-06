import Page from './page'

export default class NotSignedUpPage extends Page {
  constructor() {
    super('There is a problem')
  }

  override checkOnPage() {
    cy.get('h2').contains('There is a problem')
  }
}
