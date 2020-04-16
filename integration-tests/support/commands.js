Cypress.Commands.add('login', () => {
  cy.request('/')
  cy.task('getLognUrl').then(cy.visit)
})
