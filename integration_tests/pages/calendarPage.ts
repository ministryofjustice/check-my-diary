import { format } from 'date-fns'
import Page, { PageElement } from './page'

export default class CalendarPage extends Page {
  constructor(date?: string) {
    super(date || format(new Date(), 'MMMM yyyy'))
  }

  day = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`)

  previousMonth = (): PageElement => cy.get(`a[data-qa="previous"]`)

  banner = (): PageElement => cy.get('.govuk-notification-banner')

  notificationBannerLink = (): PageElement => cy.get('.govuk-notification-banner__link')

  detailStart = (date: number): PageElement => cy.get(`li[data-qa="${date}"] .day_start`)

  detailFinish = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.day_finish')

  detailStartOvertime = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.overtime_day_start')

  detailStartNight = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.night_start')

  detailFinishNight = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.night_finish')

  detailOvertimeStartNight = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.overtime_night_start')

  detailOvertimeFinishNight = (date: number): PageElement =>
    cy.get(`li[data-qa="${date}"]`).get('.overtime_night_finish')

  detailFinishOvertime = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.overtime_day_finish')

  detailRestDay = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.rest-day')

  detailHoliday = (date: number): PageElement => cy.get(`li[data-qa="${date}"]`).get('.holiday')
}
