import Page, { PageElement } from './page'

export default class NotificationPage extends Page {
  constructor() {
    super('Your notifications')
  }

  manage = (): PageElement => cy.contains('Manage your notifications')
}
