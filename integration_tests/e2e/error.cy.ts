context('A staff member can view their notifications', () => {
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: true, emailVerified: true })
    cy.login()
  })

  it('Errors are handled by error page', () => {
    cy.visit('/notifications', { failOnStatusCode: false })
    cy.get('h1').contains('Request failed with status code 404')
  })

  it('Auth error page can be rendered', () => {
    cy.visit('/autherror', { failOnStatusCode: false })
    cy.get('h1').contains('Authorisation Error')
  })
})
