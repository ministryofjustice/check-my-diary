const request = require('supertest')
const createRouter = require('./calendar')
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

const fakeCalendarData1 = {
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
      date: '2020-02-01',
      dailyStartDateTime: '2020-02-01T08:30:00',
      dailyEndDateTime: '2020-02-01T19:30:00',
      type: 'Shift',
      startDateTime: '2020-02-01T08:30:00',
      endDateTime: '2020-02-01T19:30:00',
      durationInSeconds: 36000,
    },
    {
      date: '2020-02-02',
      dailyStartDateTime: '2020-02-02T07:30:00',
      dailyEndDateTime: '2020-02-02T17:15:00',
      type: 'Shift',
      startDateTime: '2020-02-02T07:30:00',
      endDateTime: '2020-02-02T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-02-03',
      dailyStartDateTime: '2020-02-03T08:30:00',
      dailyEndDateTime: '2020-02-03T19:15:00',
      type: 'Secondment',
      startDateTime: '2020-02-03T08:30:00',
      endDateTime: '2020-02-03T19:15:00',
      durationInSeconds: 34980,
    },
    {
      date: '2020-02-04',
      dailyStartDateTime: '2020-02-04T07:45:00',
      dailyEndDateTime: '2020-02-04T19:30:00',
      type: 'Shift',
      startDateTime: '2020-02-04T07:45:00',
      endDateTime: '2020-02-04T19:30:00',
      durationInSeconds: 36900,
    },
    {
      date: '2020-02-05',
      dailyStartDateTime: '2020-02-05T07:30:00',
      dailyEndDateTime: '2020-02-05T17:15:00',
      type: 'Shift',
      startDateTime: '2020-02-05T07:30:00',
      endDateTime: '2020-02-05T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-02-06',
      dailyStartDateTime: '2020-02-06T07:30:00',
      dailyEndDateTime: '2020-02-06T17:15:00',
      type: 'Shift',
      startDateTime: '2020-02-06T07:30:00',
      endDateTime: '2020-02-06T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-02-07',
      dailyStartDateTime: '2020-02-07T00:00:00',
      dailyEndDateTime: '2020-02-07T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-02-07T00:00:00',
      endDateTime: '2020-02-07T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-02-08',
      dailyStartDateTime: '2020-02-08T07:15:00',
      dailyEndDateTime: '2020-02-08T12:30:00',
      type: 'Shift',
      startDateTime: '2020-02-08T07:15:00',
      endDateTime: '2020-02-08T12:30:00',
      durationInSeconds: 18900,
    },
    {
      date: '2020-02-09',
      dailyStartDateTime: '2020-02-09T13:30:00',
      dailyEndDateTime: '2020-02-09T19:30:00',
      type: 'Shift',
      startDateTime: '2020-02-09T13:30:00',
      endDateTime: '2020-02-09T19:30:00',
      durationInSeconds: 21600,
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
      date: '2020-02-11',
      dailyStartDateTime: '2020-02-11T07:30:00',
      dailyEndDateTime: '2020-02-11T18:30:00',
      type: 'Shift',
      startDateTime: '2020-02-11T07:30:00',
      endDateTime: '2020-02-11T18:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-02-12',
      dailyStartDateTime: '2020-02-12T07:30:00',
      dailyEndDateTime: '2020-02-12T17:30:00',
      type: 'Shift',
      startDateTime: '2020-02-12T07:30:00',
      endDateTime: '2020-02-12T17:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-02-13',
      dailyStartDateTime: '2020-02-13T07:30:00',
      dailyEndDateTime: '2020-02-13T18:30:00',
      type: 'Shift',
      startDateTime: '2020-02-13T07:30:00',
      endDateTime: '2020-02-13T18:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-02-14',
      dailyStartDateTime: '2020-02-14T00:00:00',
      dailyEndDateTime: '2020-02-14T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-02-14T00:00:00',
      endDateTime: '2020-02-14T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-02-15',
      dailyStartDateTime: '2020-02-15T07:15:00',
      dailyEndDateTime: '2020-02-15T13:30:00',
      type: 'Shift',
      startDateTime: '2020-02-15T07:15:00',
      endDateTime: '2020-02-15T13:30:00',
      durationInSeconds: 18000,
    },
    {
      date: '2020-02-16',
      dailyStartDateTime: '2020-02-16T08:30:00',
      dailyEndDateTime: '2020-02-16T19:30:00',
      type: 'Shift',
      startDateTime: '2020-02-16T08:30:00',
      endDateTime: '2020-02-16T19:30:00',
      durationInSeconds: 36000,
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
      date: '2020-02-18',
      dailyStartDateTime: '2020-02-18T00:00:00',
      dailyEndDateTime: '2020-02-18T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-02-18T00:00:00',
      endDateTime: '2020-02-18T23:59:59',
      durationInSeconds: 86399,
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
      date: '2020-02-20',
      dailyStartDateTime: '2020-02-20T20:45:00',
      dailyEndDateTime: '2020-02-19T17:15:00',
      type: 'Shift',
      startDateTime: '2020-02-20T20:45:00',
      endDateTime: '2020-02-21T07:45:00',
      durationInSeconds: 39600,
    },
    {
      date: '2020-02-21',
      dailyStartDateTime: '2020-02-21T20:45:00',
      dailyEndDateTime: '2020-02-21T07:45:00',
      type: 'Shift',
      startDateTime: '2020-02-21T20:45:00',
      endDateTime: '2020-02-22T07:30:00',
      durationInSeconds: 38700,
    },
    {
      date: '2020-02-22',
      dailyStartDateTime: '2020-02-22T20:45:00',
      dailyEndDateTime: '2020-02-22T07:30:00',
      type: 'Shift',
      startDateTime: '2020-02-22T20:45:00',
      endDateTime: '2020-02-23T07:45:00',
      durationInSeconds: 39600,
    },
    {
      date: '2020-02-23',
      dailyStartDateTime: '2020-02-23T20:45:00',
      dailyEndDateTime: '2020-02-23T07:45:00',
      type: 'Shift',
      startDateTime: '2020-02-23T20:45:00',
      endDateTime: '2020-02-24T07:45:00',
      durationInSeconds: 39600,
    },
    {
      date: '2020-02-24',
      dailyStartDateTime: '2020-02-24T20:45:00',
      dailyEndDateTime: '2020-02-24T07:45:00',
      type: 'Shift',
      startDateTime: '2020-02-24T20:45:00',
      endDateTime: '2020-02-25T07:15:00',
      durationInSeconds: 37800,
    },
    {
      date: '2020-02-25',
      dailyStartDateTime: '2020-02-25T07:15:00',
      dailyEndDateTime: '2020-02-25T12:30:00',
      type: 'Shift',
      startDateTime: '2020-02-25T07:15:00',
      endDateTime: '2020-02-25T12:30:00',
      durationInSeconds: 18900,
    },
    {
      date: '2020-02-26',
      dailyStartDateTime: '2020-02-26T07:45:00',
      dailyEndDateTime: '2020-02-26T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-02-26T07:45:00',
      endDateTime: '2020-02-26T23:59:59',
      durationInSeconds: 58499,
    },
    {
      date: '2020-02-27',
      dailyStartDateTime: '2020-02-27T00:00:00',
      dailyEndDateTime: '2020-02-27T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-02-27T00:00:00',
      endDateTime: '2020-02-27T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-02-28',
      dailyStartDateTime: '2020-02-28T00:00:00',
      dailyEndDateTime: '2020-02-28T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-02-28T00:00:00',
      endDateTime: '2020-02-28T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-02-29',
      dailyStartDateTime: '2020-02-29T07:30:00',
      dailyEndDateTime: '2020-02-29T12:30:00',
      type: 'Shift',
      startDateTime: '2020-02-29T07:30:00',
      endDateTime: '2020-02-29T12:30:00',
      durationInSeconds: 18000,
    },
  ],
}

const fakeCalendarData2 = {
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
      date: '2020-03-03',
      dailyStartDateTime: '2020-03-03T08:30:00',
      dailyEndDateTime: '2020-03-03T19:30:00',
      type: 'Shift',
      startDateTime: '2020-03-03T08:30:00',
      endDateTime: '2020-03-03T19:30:00',
      durationInSeconds: 36000,
    },
    {
      date: '2020-03-04',
      dailyStartDateTime: '2020-03-04T07:30:00',
      dailyEndDateTime: '2020-03-04T17:15:00',
      type: 'Shift',
      startDateTime: '2020-03-04T07:30:00',
      endDateTime: '2020-03-04T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-03-05',
      dailyStartDateTime: '2020-03-05T08:30:00',
      dailyEndDateTime: '2020-03-05T19:15:00',
      type: 'Secondment',
      startDateTime: '2020-03-05T08:30:00',
      endDateTime: '2020-03-05T19:15:00',
      durationInSeconds: 34980,
    },
    {
      date: '2020-03-06',
      dailyStartDateTime: '2020-03-06T07:45:00',
      dailyEndDateTime: '2020-03-06T19:30:00',
      type: 'Shift',
      startDateTime: '2020-03-06T07:45:00',
      endDateTime: '2020-03-06T19:30:00',
      durationInSeconds: 36900,
    },
    {
      date: '2020-03-07',
      dailyStartDateTime: '2020-03-07T07:30:00',
      dailyEndDateTime: '2020-03-07T17:15:00',
      type: 'Shift',
      startDateTime: '2020-03-07T07:30:00',
      endDateTime: '2020-03-07T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-03-08',
      dailyStartDateTime: '2020-03-08T07:30:00',
      dailyEndDateTime: '2020-03-08T17:15:00',
      type: 'Shift',
      startDateTime: '2020-03-08T07:30:00',
      endDateTime: '2020-03-08T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-03-09',
      dailyStartDateTime: '2020-03-09T00:00:00',
      dailyEndDateTime: '2020-03-09T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-03-09T00:00:00',
      endDateTime: '2020-03-09T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-03-10',
      dailyStartDateTime: '2020-03-10T07:15:00',
      dailyEndDateTime: '2020-03-10T12:30:00',
      type: 'Shift',
      startDateTime: '2020-03-10T07:15:00',
      endDateTime: '2020-03-10T12:30:00',
      durationInSeconds: 18900,
    },
    {
      date: '2020-03-11',
      dailyStartDateTime: '2020-03-11T13:30:00',
      dailyEndDateTime: '2020-03-11T19:30:00',
      type: 'Shift',
      startDateTime: '2020-03-11T13:30:00',
      endDateTime: '2020-03-11T19:30:00',
      durationInSeconds: 21600,
    },
    {
      date: '2020-03-12',
      dailyStartDateTime: '2020-03-12T07:30:00',
      dailyEndDateTime: '2020-03-12T18:30:00',
      type: 'Shift',
      startDateTime: '2020-03-12T07:30:00',
      endDateTime: '2020-03-12T18:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-03-13',
      dailyStartDateTime: '2020-03-13T07:30:00',
      dailyEndDateTime: '2020-03-13T18:30:00',
      type: 'Shift',
      startDateTime: '2020-03-13T07:30:00',
      endDateTime: '2020-03-13T18:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-03-14',
      dailyStartDateTime: '2020-03-14T07:30:00',
      dailyEndDateTime: '2020-03-14T17:30:00',
      type: 'Shift',
      startDateTime: '2020-03-14T07:30:00',
      endDateTime: '2020-03-14T17:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-03-15',
      dailyStartDateTime: '2020-03-15T07:30:00',
      dailyEndDateTime: '2020-03-15T18:30:00',
      type: 'Shift',
      startDateTime: '2020-03-15T07:30:00',
      endDateTime: '2020-03-15T18:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-03-16',
      dailyStartDateTime: '2020-03-16T00:00:00',
      dailyEndDateTime: '2020-03-16T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-03-16T00:00:00',
      endDateTime: '2020-03-16T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-03-17',
      dailyStartDateTime: '2020-03-17T07:15:00',
      dailyEndDateTime: '2020-03-17T13:30:00',
      type: 'Shift',
      startDateTime: '2020-03-17T07:15:00',
      endDateTime: '2020-03-17T13:30:00',
      durationInSeconds: 18000,
    },
    {
      date: '2020-03-18',
      dailyStartDateTime: '2020-03-18T08:30:00',
      dailyEndDateTime: '2020-03-18T19:30:00',
      type: 'Shift',
      startDateTime: '2020-03-18T08:30:00',
      endDateTime: '2020-03-18T19:30:00',
      durationInSeconds: 36000,
    },
    {
      date: '2020-03-19',
      dailyStartDateTime: '2020-03-19T07:30:00',
      dailyEndDateTime: '2020-03-19T17:30:00',
      type: 'Shift',
      startDateTime: '2020-03-19T07:30:00',
      endDateTime: '2020-03-19T17:30:00',
      durationInSeconds: 32400,
    },
    {
      date: '2020-03-20',
      dailyStartDateTime: '2020-03-20T00:00:00',
      dailyEndDateTime: '2020-03-20T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-03-20T00:00:00',
      endDateTime: '2020-03-20T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-03-21',
      dailyStartDateTime: '2020-03-21T07:30:00',
      dailyEndDateTime: '2020-03-21T17:15:00',
      type: 'Shift',
      startDateTime: '2020-03-21T07:30:00',
      endDateTime: '2020-03-21T17:15:00',
      durationInSeconds: 31500,
    },
    {
      date: '2020-03-22',
      dailyStartDateTime: '2020-03-22T20:45:00',
      dailyEndDateTime: '2020-03-21T17:15:00',
      type: 'Shift',
      startDateTime: '2020-03-22T20:45:00',
      endDateTime: '2020-03-23T07:45:00',
      durationInSeconds: 39600,
    },
    {
      date: '2020-03-23',
      dailyStartDateTime: '2020-03-23T20:45:00',
      dailyEndDateTime: '2020-03-23T07:45:00',
      type: 'Shift',
      startDateTime: '2020-03-23T20:45:00',
      endDateTime: '2020-03-24T07:30:00',
      durationInSeconds: 38700,
    },
    {
      date: '2020-03-24',
      dailyStartDateTime: '2020-03-24T20:45:00',
      dailyEndDateTime: '2020-03-24T07:30:00',
      type: 'Shift',
      startDateTime: '2020-03-24T20:45:00',
      endDateTime: '2020-03-25T07:45:00',
      durationInSeconds: 39600,
    },
    {
      date: '2020-03-25',
      dailyStartDateTime: '2020-03-25T20:45:00',
      dailyEndDateTime: '2020-03-25T07:45:00',
      type: 'Shift',
      startDateTime: '2020-03-25T20:45:00',
      endDateTime: '2020-03-26T07:45:00',
      durationInSeconds: 39600,
    },
    {
      date: '2020-03-26',
      dailyStartDateTime: '2020-03-26T20:45:00',
      dailyEndDateTime: '2020-03-26T07:45:00',
      type: 'Shift',
      startDateTime: '2020-03-26T20:45:00',
      endDateTime: '2020-03-27T07:15:00',
      durationInSeconds: 37800,
    },
    {
      date: '2020-03-27',
      dailyStartDateTime: '2020-03-27T07:15:00',
      dailyEndDateTime: '2020-03-27T12:30:00',
      type: 'Shift',
      startDateTime: '2020-03-27T07:15:00',
      endDateTime: '2020-03-27T12:30:00',
      durationInSeconds: 18900,
    },
    {
      date: '2020-03-28',
      dailyStartDateTime: '2020-03-28T07:45:00',
      dailyEndDateTime: '2020-03-28T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-03-28T07:45:00',
      endDateTime: '2020-03-28T23:59:59',
      durationInSeconds: 58499,
    },
    {
      date: '2020-03-29',
      dailyStartDateTime: '2020-03-29T00:00:00',
      dailyEndDateTime: '2020-03-29T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-03-29T00:00:00',
      endDateTime: '2020-03-29T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-03-30',
      dailyStartDateTime: '2020-03-30T00:00:00',
      dailyEndDateTime: '2020-03-30T23:59:59',
      type: 'Rest Day',
      startDateTime: '2020-03-30T00:00:00',
      endDateTime: '2020-03-30T23:59:59',
      durationInSeconds: 86399,
    },
    {
      date: '2020-03-31',
      dailyStartDateTime: '2020-03-31T07:30:00',
      dailyEndDateTime: '2020-03-31T12:30:00',
      type: 'Shift',
      startDateTime: '2020-03-31T07:30:00',
      endDateTime: '2020-03-31T12:30:00',
      durationInSeconds: 18000,
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

const notificationService = {
  getShiftNotifications: jest.fn(),
}

const calendarService = {
  getCalendarData: jest.fn(),
}

const logger = {
  info: jest.fn(),
  error: jest.fn(),
}

const standardRoute = standardRouter({ authenticationMiddleware })
const calendarRoute = standardRoute(createRouter(logger, calendarService, notificationService))

let app

beforeEach(() => {
  app = appSetup(calendarRoute)
  notificationService.getShiftNotifications.mockReturnValue(fakeShiftNotifications)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET and POST for /:date', () => {
  it('returns calendar page for February 2020', async () => {
    await calendarService.getCalendarData.mockReturnValue(fakeCalendarData1)

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
        expect(res.text).toContain('details/2020-02-01')
        expect(res.text).toContain('details/2020-02-02')
        expect(res.text).toContain('Secondment')
        expect(res.text).toContain('details/2020-02-04')

        expect(calendarService.getCalendarData).toHaveBeenCalledTimes(1)
        expect(notificationService.getShiftNotifications).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
      })
  })

  it('returns calendar page for March 2020', async () => {
    await calendarService.getCalendarData.mockReturnValue(fakeCalendarData2)

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

        expect(res.text).toContain('details/2020-03-01')
        expect(res.text).toContain('details/2020-03-02')
        expect(res.text).toContain('details/2020-03-03')

        expect(calendarService.getCalendarData).toHaveBeenCalledTimes(1)
        expect(notificationService.getShiftNotifications).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
      })
  })
})
