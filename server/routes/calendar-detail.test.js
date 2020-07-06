const request = require('supertest')
const createRouter = require('./calendar-detail')
const standardRouter = require('./standardRouter')
const { authenticationMiddleware } = require('./testutils/mockAuthentication')
const appSetup = require('./testutils/appSetup')

const fakeCalendarDetailData1 = {
  tasks: [
    {
      date: '2020-04-01',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Present',
      taskType: 'Unspecific',
      startDateTime: '2020-04-01T07:30:00',
      endDateTime: '2020-04-01T12:30:00',
    },
    {
      date: '2020-04-01',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Break (Unpaid)',
      taskType: 'Break',
      startDateTime: '2020-04-01T12:30:00',
      endDateTime: '2020-04-01T13:30:00',
    },
    {
      date: '2020-04-01',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Present',
      taskType: 'Unspecific',
      startDateTime: '2020-04-01T13:30:00',
      endDateTime: '2020-04-01T17:30:00',
    },
  ],
}

const fakeCalendarOvertimeDetailData1 = {
  tasks: [
    {
      date: '2020-04-01',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Present',
      taskType: 'Unspecific',
      startDateTime: '2020-04-01T17:30:00',
      endDateTime: '2020-04-01T20:30:00',
    },
  ],
}

const fakeCalendarDetailData2 = {
  tasks: [
    {
      date: '2020-04-03',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Training - Internal',
      taskType: 'Unspecific',
      startDateTime: '2020-04-03T08:30:00',
      endDateTime: '2020-04-03T12:15:00',
    },
    {
      date: '2020-04-03',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Break (Unpaid)',
      taskType: 'Break',
      startDateTime: '2020-04-03T12:15:00',
      endDateTime: '2020-04-03T13:15:00',
    },
    {
      date: '2020-04-03',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Duty Manager',
      taskType: 'Unspecific',
      startDateTime: '2020-04-03T13:15:00',
      endDateTime: '2020-04-03T17:30:00',
    },
    {
      date: '2020-04-03',
      dailyStartDateTime: 'null',
      dailyEndDateTime: 'null',
      label: 'Present',
      taskType: 'Unspecific',
      startDateTime: '2020-04-03T17:30:00',
      endDateTime: '2020-04-03T19:30:00',
    },
  ],
}

const fakeUserAuthenticationDetails = [
  {
    ApiUrl: 'https://localhost:80',
  },
]

const userAuthenticationService = {
  getUserAuthenticationDetails: jest.fn(),
}

const calendarService = {
  getCalendarDetails: jest.fn(),
}

const calendarOvertimeService = {
  getCalendarOvertimeDetails: jest.fn(),
}

const logger = {
  info: jest.fn(),
  error: jest.fn(),
}

const standardRoute = standardRouter({ authenticationMiddleware })
const calendarRoute = standardRoute(createRouter(logger, calendarOvertimeService, userAuthenticationService))

let app

beforeEach(() => {
  const service = { calendarService }
  app = appSetup(calendarRoute, service)
  userAuthenticationService.getUserAuthenticationDetails.mockReturnValue(fakeUserAuthenticationDetails)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET and POST for /:details', () => {
  it('returns calendar detail page for 1st April 2020', async () => {
    await calendarService.getCalendarDetails.mockReturnValue(fakeCalendarDetailData1)

    await calendarOvertimeService.getCalendarOvertimeDetails.mockReturnValue(fakeCalendarOvertimeDetailData1)

    await request(app)
      .get('/2020-04-01')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect((res) => {
        expect(res.text).toContain('Wednesday 1 April 2020')
        expect(res.text).toContain('/calendar/2020-04-01')
        expect(res.text).toContain('07:30 - 12:30')
        expect(res.text).toContain('Start of shift:')
        expect(res.text).toContain('Present')
        expect(res.text).toContain('12:30 - 13:30')
        expect(res.text).toContain('Break (Unpaid)')
        expect(res.text).toContain('13:30 - 17:30')
        expect(res.text).toContain('Present')
        expect(res.text).toContain('17:30')
        expect(res.text).toContain('End of shift')

        expect(res.text).toContain('Overtime')
        expect(res.text).toContain('17:30 - 20:30')
        expect(res.text).toContain('Present')
        expect(res.text).toContain('20:30')
        expect(res.text).toContain('End of shift')

        expect(calendarService.getCalendarDetails).toHaveBeenCalledTimes(1)
        expect(userAuthenticationService.getUserAuthenticationDetails).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
      })
  })
  it('returns calendar detail page for 3rd April 2020', async () => {
    await calendarService.getCalendarDetails.mockReturnValue(fakeCalendarDetailData2)

    await calendarOvertimeService.getCalendarOvertimeDetails.mockReturnValue(null)

    await request(app)
      .get('/2020-04-03')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect((res) => {
        expect(res.text).toContain('Friday 3 April 2020')
        expect(res.text).toContain('/calendar/2020-04-01')
        expect(res.text).toContain('08:30 - 12:15')
        expect(res.text).toContain('Start of shift:')
        expect(res.text).toContain('Training - Internal')
        expect(res.text).toContain('12:15 - 13:15')
        expect(res.text).toContain('Break (Unpaid)')
        expect(res.text).toContain('13:15 - 17:30')
        expect(res.text).toContain('Duty Manager')
        expect(res.text).toContain('17:30 - 19:30')
        expect(res.text).toContain('Present')
        expect(res.text).toContain('19:30')
        expect(res.text).toContain('End of shift')

        expect(calendarService.getCalendarDetails).toHaveBeenCalledTimes(1)
        expect(userAuthenticationService.getUserAuthenticationDetails).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
      })
  })
})
