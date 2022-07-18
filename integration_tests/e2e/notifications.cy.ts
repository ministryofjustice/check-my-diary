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
    cy.task('stubGetMyMfaSettings', { backupVerified: true, mobileVerified: true, emailVerified: true })
    cy.login()
  })

  it('Notification page is visible', () => {
    cy.visit('/notifications')
    cy.contains('Manage your notifications').click()
    cy.get('p').contains('You can be notified by email')
  })

  it('Notification page shows no notifications', () => {
    cy.task('stubNotificationGet', [])
    cy.visit('/notifications')

    cy.get('[data-test="summary-message"]').contains('There are no notifications')
  })

  it('Notifications are visible', () => {
    cy.visit('/notifications')
    cy.get('p').contains('has changed to [Paternity Leave]')
    cy.get('p').contains('has changed to [FMI Training]')
    cy.get('p').contains('has changed to [Late Roll (OSG)]')
    cy.get('p').contains('has changed to [FMI Training]')
    cy.get('[data-test="shift-modified"]').first().contains('8 hours ago')
    cy.get('[data-test="shift-modified"]').eq(1).contains('4 days ago')
    cy.get('[data-test="shift-modified"]').eq(2).contains('2 months ago')
    cy.get('[data-test="shift-modified"]').last().contains('3 years ago')
  })

  it('Notifications banner is visible', () => {
    cy.visit('/notifications')
    cy.contains('Manage your notifications').click()
    cy.get('p').contains('You have paused your notifications')
    cy.get('button').contains('Resume notifications now')
  })
})
