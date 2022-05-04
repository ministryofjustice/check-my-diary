import Page, { PageElement } from './page'

export default class CalendarPage extends Page {
  constructor(date: string) {
    super(date)
  }

  notificationTab = (): PageElement => cy.get('a[href="/notifications"]')

  day = (date: string): PageElement => cy.get(`a[href="/details/${date}"]`)

  nextMonth = (date: string): PageElement => cy.get(`a[href="/calendar/${date}"]`)

  previousMonth = (date: string): PageElement => cy.get(`a[href="/calendar/${date}"]`)
}
