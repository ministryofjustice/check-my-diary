context('A staff member can view their notifications', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubShifts')
    cy.task('stubNotificationCount')
    cy.task('stubNotifications')

    cy.login()

    cy.visit('/notifications')
  })

  it('Notification page is visible', () => {
    cy.contains('Manage your notifications').click()
    cy.get('p').contains('You can be notified by email')
  })

  it('Notifications are visible', () => {
    cy.get('p').contains('has changed to [Paternity Leave]')
    cy.get('p').contains('has changed to [FMI Training]')
    cy.get('p').contains('has changed to [Late Roll (OSG)]')
    cy.get('p').contains('has changed to [FMI Training]')
  })

  it('Notifications banner is visible', () => {
    cy.contains('Manage your notifications').click()
    cy.get('p').contains('You have paused your notifications')
    cy.get('button').contains('Resume notifications now')
  })
})
