import { format } from 'date-fns'
import Page, { PageElement } from './page'

export enum mobileOrDesktopType {
  mobile = 'm',
  desktop = 'd',
}

export default class CalendarPage extends Page {
  constructor(date?: string) {
    super(date || format(new Date(), 'MMMM yyyy'))
  }

  day = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): PageElement =>
    cy.get(`li[data-qa="${mobileOrDesktop}${date}"]`)

  dayDesktop = (date: number): PageElement => cy.get(`li[data-qa="d${date}"]`)

  previousMonth = (): PageElement => cy.get(`a[data-qa="previous"]`)

  bannerSMS = (): PageElement => cy.get('#banner-sms')

  bannerMFA = (): PageElement => cy.get('#banner-mfa')

  notificationBannerSmsLink = (): PageElement => cy.get('[data-test="banner-sms-notification-link"]')

  dpsLink = (): PageElement => cy.get('.govuk-breadcrumbs')

  detailStart = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): PageElement =>
    cy.get(`li[data-qa="${mobileOrDesktop}${date}"] .day_start`)

  detailFinish = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): PageElement =>
    cy.get(`li[data-qa="${mobileOrDesktop}${date}"]`).get('.day_finish')

  detailStartNight = (date: number, mobileOrDesktop: mobileOrDesktopType = mobileOrDesktopType.mobile): PageElement =>
    cy.get(`li[data-qa="${mobileOrDesktop}${date}"]`).get('.night_start')

  shouldHaveClassAtLine = (n: number, expectedClazz: string) =>
    this.shouldHaveClass(cy.get('span.line').eq(n), expectedClazz)

  shouldHaveClass = (element: PageElement, expectedClazz: string) =>
    element.should('have.attr', 'class').then(clazz => {
      expect(clazz).to.contains(expectedClazz)
    })
}
