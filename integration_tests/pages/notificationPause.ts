import Page, { PageElement } from './page'

export default class NotificationPausePage extends Page {
  constructor() {
    super('How long do you want to pause notifications for')
  }

  pauseValue = (): PageElement => cy.get('input[name="pauseValue"]')

  pauseUnit = (): PageElement => cy.get('select[name="pauseUnit"]')

  pauseUnitSelected = (): PageElement => cy.get('select[name="pauseUnit"] option:selected')

  submit = (): PageElement => cy.contains('Confirm').click()
}
