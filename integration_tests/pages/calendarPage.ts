import { format } from 'date-fns'
import Page, { PageElement } from './page'

export default class CalendarPage extends Page {
  constructor(date?: string) {
    super(date || format(new Date(), 'MMMM yyyy'))
  }

  day = (date: string): PageElement => cy.get(`a[href="/details/${date}"]`)

  previousMonth = (): PageElement => cy.get(`a[data-qa="previous"]`)

  banner = (): PageElement => cy.get('.govuk-notification-banner')

  notificationBannerLink = (): PageElement => cy.get('.govuk-notification-banner__link')
}
