const { stubFor } = require('./wiremock')
const data = require('./calendar_data')

const stubShifts = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/user/details',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: data,
    },
  })

const stubRestDay = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-09',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-09',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Rest Day',
            taskType: 'Absence',
            startDateTime: '2020-03-09T00:00:00',
            endDateTime: '2020-03-09T23:59:59',
          },
        ],
      },
    },
  })

const stubHoliday = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-28',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-28',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Holiday',
            taskType: 'Absence',
            startDateTime: '2020-03-28T00:00:00',
            endDateTime: '2020-03-28T23:59:59',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift1 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-08',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-08',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Absence',
            startDateTime: '2020-03-08T07:30:00',
            endDateTime: '2020-03-08T12:30:00',
          },
          {
            date: '2020-03-08',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Break (Unpaid)',
            taskType: 'Break',
            startDateTime: '2020-03-08T12:30:00',
            endDateTime: '2020-03-08T13:30:00',
          },
          {
            date: '2020-03-08',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Security Manager',
            taskType: 'Unspecific',
            startDateTime: '2020-03-08T13:30:00',
            endDateTime: '2020-03-08T17:15:00',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift2 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/overtime/tasks\\?date=2020-03-08',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-08',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Absence',
            startDateTime: '2020-03-08T17:30:00',
            endDateTime: '2020-03-08T20:30:00',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift3 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/overtime/tasks\\?date=2020-03-09',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-09',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Absence',
            startDateTime: '2020-03-09T17:30:00',
            endDateTime: '2020-03-09T20:30:00',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift4 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/overtime/tasks\\?date=2020-03-28',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-28',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Absence',
            startDateTime: '2020-03-28T17:30:00',
            endDateTime: '2020-03-28T20:30:00',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift5 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/overtime/tasks\\?date=2020-03-22',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-22',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Absence',
            startDateTime: '2020-03-22T16:30:00',
            endDateTime: '2020-03-22T19:30:00',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift6 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/overtime/tasks\\?date=2020-03-26',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-26',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Absence',
            startDateTime: '2020-03-26T08:00:00',
            endDateTime: '2020-03-26T12:30:00',
          },
        ],
      },
    },
  })

const stubOvertimeDayShift7 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/overtime/tasks\\?date=2020-03-24',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-24',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Duty Manager',
            taskType: 'Unspecific',
            startDateTime: '2020-03-24T08:30:00',
            endDateTime: '2020-03-24T12:30:00',
          },
        ],
      },
    },
  })

const stubDayShift1 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-06',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-06',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Training - Internal',
            taskType: 'Unspecific',
            startDateTime: '2020-03-06T08:30:00',
            endDateTime: '2020-03-06T12:15:00',
          },
          {
            date: '2020-03-06',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Break (Unpaid)',
            taskType: 'Break',
            startDateTime: '2020-03-06T12:15:00',
            endDateTime: '2020-03-06T13:15:00',
          },
          {
            date: '2020-03-06',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Duty Manager',
            taskType: 'Unspecific',
            startDateTime: '2020-03-06T13:15:00',
            endDateTime: '2020-03-06T17:30:00',
          },
          {
            date: '2020-03-06',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Present',
            taskType: 'Unspecific',
            startDateTime: '2020-03-06T17:30:00',
            endDateTime: '2020-03-06T19:30:00',
          },
        ],
      },
    },
  })

const stubDayShift2 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-07',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-07',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Training - Internal',
            taskType: 'Unspecific',
            startDateTime: '2020-03-07T07:30:00',
            endDateTime: '2020-03-07T12:15:00',
          },
          {
            date: '2020-03-07',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Break (Unpaid)',
            taskType: 'Break',
            startDateTime: '2020-03-07T12:15:00',
            endDateTime: '2020-03-07T13:15:00',
          },
          {
            date: '2020-03-07',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Duty Manager',
            taskType: 'Unspecific',
            startDateTime: '2020-03-07T13:15:00',
            endDateTime: '2020-03-07T17:15:00',
          },
        ],
      },
    },
  })

const stubNightShift1 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-23',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-23',
            dailyStartDateTime: '2020-03-23T20:45:00',
            dailyEndDateTime: '2020-03-23T19:30:00',
            label: 'Night Duties',
            taskType: 'Unspecific',
            startDateTime: '2020-03-23T20:45:00',
            endDateTime: '2020-03-24T07:45:00',
          },
        ],
      },
    },
  })

const stubNightShift2 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-22',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-22',
            dailyStartDateTime: '2020-03-22T20:45:00',
            dailyEndDateTime: 'null',
            label: 'Night Duties',
            taskType: 'Unspecific',
            startDateTime: '2020-03-22T20:45:00',
            endDateTime: '2020-03-23T07:45:00',
          },
        ],
      },
    },
  })

const stubNightShift3 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-26',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-26',
            dailyStartDateTime: 'null',
            dailyEndDateTime: '2020-03-26T07:45:00',
            label: 'Night Duties',
            taskType: 'Unspecific',
            startDateTime: 'null',
            endDateTime: '2020-03-26T07:45:00',
          },
        ],
      },
    },
  })

const stubNightShift4 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/tasks\\?date=2020-03-24',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-24',
            dailyStartDateTime: '2020-03-24T20:45:00',
            dailyEndDateTime: '2020-03-24T07:30:00',
            label: 'Night Duties',
            taskType: 'Unspecific',
            startDateTime: '2020-03-24T20:45:00',
            endDateTime: '2020-03-24T07:30:00',
          },
        ],
      },
    },
  })

module.exports = {
  stubTasks: () =>
    Promise.all([
      stubDayShift1(),
      stubDayShift2(),
      stubOvertimeDayShift1(),
      stubOvertimeDayShift2(),
      stubOvertimeDayShift3(),
      stubOvertimeDayShift4(),
      stubOvertimeDayShift5(),
      stubOvertimeDayShift6(),
      stubOvertimeDayShift7(),
      stubNightShift1(),
      stubNightShift2(),
      stubNightShift3(),
      stubNightShift4(),
      stubRestDay(),
      stubHoliday(),
    ]),
  stubShifts,
}
