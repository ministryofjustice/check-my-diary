const request = require('supertest')
const createRouter = require('./calendar-overtime')
const standardRouter = require('./standardRouter')
const { authenticationMiddleware } = require('./testutils/mockAuthentication')
const appSetup = require('./testutils/appSetup')

const fakeShiftNotifications = [
  {
    DateTime: '2019-05-29T13:56:55.000Z',
    Description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Paternity Leave].',
    LastModifiedDateTime: '2019-05-29T13:53:01.000Z',
    LastModifiedDateTimeInSeconds: '1559137981',
    Read: true,
  },
  {
    DateTime: '2019-05-29T13:46:27.000Z',
    Description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    LastModifiedDateTime: '2019-05-29T13:46:19.000Z',
    LastModifiedDateTimeInSeconds: '1559137579',
    Read: true,
  },
  {
    DateTime: '2019-05-29T13:43:46.000Z',
    Description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Late Roll (OSG)].',
    LastModifiedDateTime: '2019-05-29T13:43:37.000Z',
    LastModifiedDateTimeInSeconds: '1559137417',
    Read: true,
  },
  {
    DateTime: '2019-05-29T13:38:23.000Z',
    Description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    LastModifiedDateTime: '2019-05-29T13:36:43.000Z',
    LastModifiedDateTimeInSeconds: '1559137003',
    Read: true,
  },
]

const fakeCalendarOvertimeData1 = {
  shifts: [
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-01',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-02',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-03',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-04',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-05',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-06',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-07',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-08',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-09',
    },
    {
      date: '2020-02-10',
      dailyStartDateTime: '2020-02-10T07:30:00',
      dailyEndDateTime: '2020-02-10T18:30:00',
      type: 'Shift',
      startDateTime: '2020-02-10T07:30:00',
      endDateTime: '2020-02-10T18:30:00',
      durationInSeconds: 32400,
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-11',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-12',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-12',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-14',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-15',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-16',
    },
    {
      date: '2020-02-17',
      dailyStartDateTime: '2020-02-17T07:30:00',
      dailyEndDateTime: '2020-02-17T17:30:00',
      type: 'Shift',
      startDateTime: '2020-02-17T07:30:00',
      endDateTime: '2020-02-17T17:30:00',
      durationInSeconds: 32400,
    },    
    {
      type: 'no-day',
      startDateTime: '2020-02-18',
    },    
    {
      date: '2020-02-19',
      dailyStartDateTime: '2020-02-19T07:30:00',
      dailyEndDateTime: '2020-02-19T17:15:00',
      type: 'Shift',
      startDateTime: '2020-02-19T07:30:00',
      endDateTime: '2020-02-19T17:15:00',
      durationInSeconds: 31500,
    },    
    {
      type: 'no-day',
      startDateTime: '2020-02-20',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-21',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-22',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-23',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-24',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-25',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-26',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-27',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-28',
    },
    {
      type: 'no-day',
      startDateTime: '2020-02-29',
    },    
  ],
}

const fakeCalendarOvertimeData2 = {
  shifts: [
    {
      date: '2020-03-01',
      dailyStartDateTime: '2020-03-01T07:30:00',
      dailyEndDateTime: '2020-03-01T17:30:00',
      type: 'Shift',
      startDateTime: '2020-03-01T07:30:00',
      endDateTime: '2020-03-01T17:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-03-02',
      dailyStartDateTime: '2020-03-02T07:30:00',
      dailyEndDateTime: '2020-03-02T17:30:00',
      type: 'Shift',
      startDateTime: '2020-03-02T07:30:00',
      endDateTime: '2020-03-02T17:30:00',
      durationInSeconds: 32400,
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-03',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-04',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-05',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-06',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-07',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-08',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-09',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-10',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-11',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-12',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-13',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-14',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-15',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-16',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-17',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-18',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-19',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-20',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-21',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-22',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-23',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-24',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-25',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-26',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-27',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-28',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-29',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-30',
    },
    {
      type: 'no-day',
      startDateTime: '2020-03-31',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
    {
      type: 'no-day',
    },
  ],
}

const fakeUserAuthenticationDetails = [
  {
    ApiUrl: 'https://localhost:80',
  },
]

const notificationService = {
  getShiftNotifications: jest.fn(),
}

const userAuthenticationService = {
  getUserAuthenticationDetails: jest.fn(),
}

const calendarOvertimeService = {
  getCalendarOvertimeData: jest.fn(),
}

const logger = {
  info: jest.fn(),
  error: jest.fn(),
}

const standardRoute = standardRouter({ authenticationMiddleware })
const calendarOvertimeRoute = standardRoute(
  createRouter(logger, calendarOvertimeService, notificationService, userAuthenticationService),
)

let app

beforeEach(() => {
  app = appSetup(calendarOvertimeRoute)
  notificationService.getShiftNotifications.mockReturnValue(fakeShiftNotifications)
  userAuthenticationService.getUserAuthenticationDetails.mockReturnValue(fakeUserAuthenticationDetails)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET and POST for /:date', () => {
  it('returns calendar overtime page for February 2020', async () => {
    await calendarOvertimeService.getCalendarOvertimeData.mockReturnValue(fakeCalendarOvertimeData1)

    await request(app)
      .get('/2020-02-01')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect((res) => {
        expect(res.text).toContain('February 2020')
        expect(res.text).toContain('Sunday')
        expect(res.text).toContain('Monday')
        expect(res.text).toContain('Tuesday')
        expect(res.text).toContain('Wednesday')
        expect(res.text).toContain('Thursday')
        expect(res.text).toContain('Friday')
        expect(res.text).toContain('Saturday')
        expect(res.text).toContain('overtime-details/2020-02-10')
        expect(res.text).toContain('overtime-details/2020-02-17')
        expect(res.text).toContain('overtime-details/2020-02-19')
        
        expect(res.text).toContain('Start 07:30')
        expect(res.text).toContain('Finish 17:15')
        expect(res.text).toContain('Finish 17:30')
        expect(res.text).toContain('Finish 18:30')

        expect(calendarOvertimeService.getCalendarOvertimeData).toHaveBeenCalledTimes(1)
        expect(notificationService.getShiftNotifications).toHaveBeenCalledTimes(1)
        expect(userAuthenticationService.getUserAuthenticationDetails).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
      })
  })

  it('returns calendar overtime page for March 2020', async () => {
    await calendarOvertimeService.getCalendarOvertimeData.mockReturnValue(fakeCalendarOvertimeData2)

    await request(app)
      .get('/2020-03-01')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect((res) => {
        expect(res.text).toContain('March 2020')
        expect(res.text).toContain('Sunday')
        expect(res.text).toContain('Monday')
        expect(res.text).toContain('Tuesday')
        expect(res.text).toContain('Wednesday')
        expect(res.text).toContain('Thursday')
        expect(res.text).toContain('Friday')
        expect(res.text).toContain('Saturday')

        expect(res.text).toContain('overtime-details/2020-03-01')
        expect(res.text).toContain('overtime-details/2020-03-02')

        expect(res.text).toContain('Start 07:30')
        expect(res.text).toContain('Finish 17:30')
        
        expect(calendarOvertimeService.getCalendarOvertimeData).toHaveBeenCalledTimes(1)
        expect(notificationService.getShiftNotifications).toHaveBeenCalledTimes(1)
        expect(userAuthenticationService.getUserAuthenticationDetails).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
      })
  })
})
