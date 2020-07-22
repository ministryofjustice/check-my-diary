context('A staff member can view their notifications', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubNotifcations')

    cy.login()

    cy.visit('/notifications')
  })

  it('Notification page is visible', () => {
    cy.get('p').contains('Get notified of shift changes')
  })

  it('Notifications are visible', () => {
    cy.get('p').contains('has changed to [Paternity Leave]')
    cy.get('p').contains('has changed to [FMI Training]')
    cy.get('p').contains('has changed to [Late Roll (OSG)]')
    cy.get('p').contains('has changed to [FMI Training]')
  })

  it('Notifications banner is visible', () => {
    cy.get('h2').contains('Your notifications are paused until ')
    cy.get('button').contains('Resume notifications')
  })
})
