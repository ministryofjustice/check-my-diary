const { stubFor } = require('./wiremock')

const stubShifts = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
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
            dailyStartDateTime: '2020-03-12T07:15:00',
            dailyEndDateTime: '2020-03-12T12:30:00',
            type: 'Shift',
            startDateTime: '2020-03-12T07:15:00',
            endDateTime: '2020-03-12T12:30:00',
            durationInSeconds: 18900,
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
            dailyStartDateTime: '2020-03-21T07:15:00',
            dailyEndDateTime: '2020-03-21T12:30:00',
            type: 'Shift',
            startDateTime: '2020-03-21T07:15:00',
            endDateTime: '2020-03-21T12:30:00',
            durationInSeconds: 18900,
          },
          {
            date: '2020-03-22',
            dailyStartDateTime: '2020-03-22T20:45:00',
            dailyEndDateTime: '2020-03-21T12:30:00',
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
        ],
      },
    },
  })

const stubRestDay = () =>
  stubFor({
    priority: '5',
    request: {
      method: 'GET',
      urlPathPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-01',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Rest Day',
            taskType: 'Absence',
            startDateTime: '2020-03-01T00:00:00',
            endDateTime: '2020-03-01T23:59:59',
          },
        ],
      },
    },
  })

const stubSecondment = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-05',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        tasks: [
          {
            date: '2020-03-05',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Secondment',
            taskType: 'Absence',
            startDateTime: '2020-03-05T08:30:00',
            endDateTime: '2020-03-05T12:30:00',
          },
          {
            date: '2020-03-05',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Break (Unpaid)',
            taskType: 'Break',
            startDateTime: '2020-03-05T12:30:00',
            endDateTime: '2020-03-05T13:30:00',
          },
          {
            date: '2020-03-05',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Security Manager',
            taskType: 'Unspecific',
            startDateTime: '2020-03-05T13:30:00',
            endDateTime: '2020-03-05T15:15:00',
          },
          {
            date: '2020-03-05',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Visits Manager',
            taskType: 'Unspecific',
            startDateTime: '2020-03-05T15:15:00',
            endDateTime: '2020-03-05T17:15:00',
          },
          {
            date: '2020-03-05',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Training - Internal',
            taskType: 'Unspecific',
            startDateTime: '2020-03-05T17:17:00',
            endDateTime: '2020-03-05T18:15:00',
          },
          {
            date: '2020-03-05',
            dailyStartDateTime: 'null',
            dailyEndDateTime: 'null',
            label: 'Union Duties (Grievance)',
            taskType: 'Unspecific',
            startDateTime: '2020-03-05T18:15:00',
            endDateTime: '2020-03-05T19:15:00',
          },
        ],
      },
    },
  })

const stubDayShift = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-04',
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

const stubNightShift = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-07',
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
            dailyEndDateTime: '2020-03-21T19:30:00',
            label: 'Night Duties',
            taskType: 'Unspecific',
            startDateTime: '2020-03-22T20:45:00',
            endDateTime: '2020-03-23T07:45:00',
          },
        ],
      },
    },
  })

const stubStaffLookup = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/api/staff-members/quantum/([a-zA-Z0-9_]*)',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        staffMembers: [
          {
            id: 2118,
            planUnitId: 1326,
            planUnitName: 'Manchester Band 5',
            employeeName: 'Smith, Joe',
            personnelNumber: 'R2_ID2118',
          },
        ],
      },
    },
  })

const stubHealth = async () =>
  stubFor({
    request: {
      method: 'GET',
      url: '/api/health',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Healthy',
    },
  })

const stubHealthInvision = async () =>
  stubFor({
    request: {
      method: 'GET',
      url: '/api/health/invision',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Healthy',
    },
  })

module.exports = {
  stubStaffLookup,
  stubTasks: () => Promise.all([stubDayShift(), stubNightShift(), stubSecondment(), stubRestDay()]),
  stubShifts,
  stubHealthCalls: () => Promise.all([stubHealth(), stubHealthInvision()]),
}
