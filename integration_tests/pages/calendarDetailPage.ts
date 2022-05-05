import Page, { PageElement } from './page'

export default class CalendarDetailPage extends Page {
  constructor(date: string) {
    super(date)
  }

  detailStart = (): PageElement => cy.get('.day_start')

  detailStartOvertime = (): PageElement => cy.get('.overtime_day_start')

  detailStartNight = (): PageElement => cy.get('.night_start')

  detailFinishNight = (): PageElement => cy.get('.night_finish')

  detailOvertimeStartNight = (): PageElement => cy.get('.overtime_night_start')

  detailOvertimeFinishNight = (): PageElement => cy.get('.overtime_night_finish')

  detailFinish = (): PageElement => cy.get('.day_finish')

  detailFinishOvertime = (): PageElement => cy.get('.overtime_day_finish')

  detailRestDay = (): PageElement => cy.get('.rest-day')

  detailHoliday = (): PageElement => cy.get('.holiday')

  previousDay = (): PageElement => cy.get('#btnPreviousShiftDetail')

  nextDay = (): PageElement => cy.get('#btnNextShiftDetail')
}
