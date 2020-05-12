const moment = require('moment')
const CalendarPage = require('../pages/calendarPage')
const CalendarOvertimePage = require('../pages/calendarOvertimePage')
const CalendarDetailPage = require('../pages/calendarDetailPage')

context('A staff member can view their overtime calendar', () => {
  before(() => {
    cy.task('createTablesInsertData')
  })
  beforeEach(() => {
    cy.task('reset')

    cy.task('stubLogin')
    cy.task('stubHealthCalls')
    cy.task('stubStaffLookup')
    cy.task('stubShifts')
    cy.task('stubOvertimeShifts')
    cy.login()
  })

  it('A staff member can view their calendar', () => {
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const calendarOvertimePage = CalendarOvertimePage.verifyOnPage(moment().format('MMMM YYYY'))

    const overtimeTab = calendarPage.overtimeTab(moment().startOf('month').format('YYYY-MM-DD'))
    overtimeTab.click()

    const now = new Date()

    const monthDifference = moment([now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')).diff(
      new Date('2020-02-01'),
      'months',
      true,
    )

    for (let x = 1; x <= monthDifference; x += 1) {
      const month = calendarOvertimePage.previousMonth(
        moment().subtract(x, 'months').startOf('month').format('YYYY-MM-DD'),
      )
      month.click()
    }

    const dayShift1 = calendarOvertimePage.day('2020-02-10')
    dayShift1.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Monday, 10', '10', 'Start 07:30', 'Finish 18:30', '9hrs'])
    })

    const dayShift2 = calendarOvertimePage.day('2020-02-17')
    dayShift2.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Monday, 17', '17', 'Start 07:30', 'Finish 17:30', '9hrs'])
    })

    const dayShift3 = calendarOvertimePage.day('2020-02-19')
    dayShift3.children().should((spans) => {
      const allText = spans.map((i, el) => Cypress.$(el).text().trim())
      expect(allText.get()).to.deep.eq(['Wednesday, 19', '19', 'Start 07:30', 'Finish 17:15', '8hrs 45mins'])
    })
  })

  it('A staff member can drill into a overtime day shift', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const calendarOvertimePage = CalendarOvertimePage.verifyOnPage(moment().format('MMMM YYYY'))

    const overtimeTab = calendarPage.overtimeTab(moment().startOf('month').format('YYYY-MM-DD'))
    overtimeTab.click()

    const now = new Date()

    const monthDifference = moment([now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')).diff(
      new Date('2020-02-01'),
      'months',
      true,
    )

    for (let x = 1; x <= monthDifference; x += 1) {
      const month = calendarOvertimePage.previousMonth(
        moment().subtract(x, 'months').startOf('month').format('YYYY-MM-DD'),
      )
      month.click()
    }

    const dayShift = calendarOvertimePage.day('2020-02-10')
    dayShift.click()

    const calendarDetailPage = CalendarDetailPage.verifyOnPage('Monday 10 February 2020')
    calendarDetailPage
      .detailStart()
      .should('contain', '07:30 - 12:30')
      .should('contain', 'Start of shift')
      .should('contain', 'Training - Internal')
    calendarDetailPage.detailFinish().should('contain', '17:30').should('contain.text', 'End of shift')
  })
  it('A staff member navigate to different days in overtime calendar', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const calendarOvertimePage = CalendarOvertimePage.verifyOnPage(moment().format('MMMM YYYY'))

    const overtimeTab = calendarPage.overtimeTab(moment().startOf('month').format('YYYY-MM-DD'))
    overtimeTab.click()

    const now = new Date()

    const monthDifference = moment([now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')).diff(
      new Date('2020-02-01'),
      'months',
      true,
    )

    for (let x = 1; x <= monthDifference; x += 1) {
      const month = calendarOvertimePage.previousMonth(
        moment().subtract(x, 'months').startOf('month').format('YYYY-MM-DD'),
      )
      month.click()
    }

    const dayShift = calendarOvertimePage.day('2020-02-10')
    dayShift.click()

    const calendarDetailPage1 = CalendarDetailPage.verifyOnPage('Monday 10 February 2020')
    calendarDetailPage1.nextDay().should('contain.text', 'Tuesday 11 February 2020').click()

    const calendarDetailPage2 = CalendarDetailPage.verifyOnPage('Tuesday 11 February 2020')
    calendarDetailPage2.previousDay().should('contain.text', 'Monday 10 February 2020').click()

    const calendarDetailPage3 = CalendarDetailPage.verifyOnPage('Monday 10 February 2020')
    calendarDetailPage3.previousDay().should('contain.text', 'Sunday 9 February 2020').click()

    const calendarDetailPage4 = CalendarDetailPage.verifyOnPage('Sunday 9 February 2020')
    calendarDetailPage4.nextDay().should('contain.text', 'Monday 10 February 2020').click()
  })
  it('A staff member navigate to different days in overtime calendar, shows no Shift data', () => {
    cy.task('stubTasks')
    const calendarPage = CalendarPage.verifyOnPage(moment().format('MMMM YYYY'))
    const calendarOvertimePage = CalendarOvertimePage.verifyOnPage(moment().format('MMMM YYYY'))

    const overtimeTab = calendarPage.overtimeTab(moment().startOf('month').format('YYYY-MM-DD'))
    overtimeTab.click()

    const now = new Date()

    const monthDifference = moment([now.getFullYear(), `0${now.getMonth() + 1}`.slice(-2), '01'].join('-')).diff(
      new Date('2020-02-01'),
      'months',
      true,
    )

    for (let x = 1; x <= monthDifference; x += 1) {
      const month = calendarOvertimePage.previousMonth(
        moment().subtract(x, 'months').startOf('month').format('YYYY-MM-DD'),
      )
      month.click()
    }

    const dayShift = calendarOvertimePage.day('2020-02-10')
    dayShift.click()

    const calendarDetailPage1 = CalendarDetailPage.verifyOnPage('Monday 10 February 2020')
    calendarDetailPage1.nextDay().should('contain.text', 'Tuesday 11 February 2020').click()

    const calendarDetailPage2 = CalendarDetailPage.verifyOnPage('Tuesday 11 February 2020')
    calendarDetailPage2.detailRestDay().should('contain.text', 'No Shift Data')
  })
})
