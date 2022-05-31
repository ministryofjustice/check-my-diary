import Page, { PageElement } from './page'

export default class NotificationManagePage extends Page {
  constructor() {
    super('Manage your notifications')
  }

  pause = (): PageElement => cy.contains('Pause notifications')
}
