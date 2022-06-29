context('A staff member can view their notifications', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')

    cy.login()
  })

  it('Errors are handled by error page', () => {
    cy.visit('/notifications', { failOnStatusCode: false })
    cy.get('h1').contains('Request failed with status code 404')
  })
})
