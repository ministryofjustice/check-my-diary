export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage = <T>(constructor: new () => T): T => new constructor()

  static verifyOnPageTitle = <T>(constructor: new (string) => T, title: string): T => new constructor(title)

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')
}
