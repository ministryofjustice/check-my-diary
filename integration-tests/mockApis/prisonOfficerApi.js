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
            overtime: true,
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
            overtime: true,
          },
          {
            date: '2020-03-09',
            dailyStartDateTime: '2020-03-09T00:00:00',
            dailyEndDateTime: '2020-03-09T23:59:59',
            type: 'Rest Day',
            startDateTime: '2020-03-09T00:00:00',
            endDateTime: '2020-03-09T23:59:59',
            durationInSeconds: 86399,
            overtime: true,
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
            overtime: true,
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
            overtime: true,
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
            overtime: true,
          },
          {
            date: '2020-03-17',
            dailyStartDateTime: '2020-03-17T07:15:00',
            dailyEndDateTime: '2020-03-17T13:30:00',
            type: 'Shift',
            startDateTime: '2020-03-17T07:15:00',
            endDateTime: '2020-03-17T13:30:00',
            durationInSeconds: 18000,
            overtime: true,
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
            dailyEndDateTime: 'null',
            type: 'Shift',
            startDateTime: '2020-03-22T20:45:00',
            endDateTime: '2020-03-23T07:45:00',
            durationInSeconds: 39600,
            overtime: true,
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
            overtime: true,
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
            dailyStartDateTime: 'null',
            dailyEndDateTime: '2020-03-26T07:45:00',
            type: 'Shift',
            startDateTime: '2020-03-26T20:45:00',
            endDateTime: '2020-03-27T07:15:00',
            durationInSeconds: 37800,
            overtime: true,
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
            type: 'Holiday',
            startDateTime: '2020-03-28T07:45:00',
            endDateTime: '2020-03-28T23:59:59',
            durationInSeconds: 58499,
            overtime: true,
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
            dailyStartDateTime: '2020-03-31T00:00:00',
            dailyEndDateTime: '2020-03-31T23:59:59',
            type: 'Rest Day',
            startDateTime: '2020-03-31T00:00:00',
            endDateTime: '2020-03-31T23:59:59',
            durationInSeconds: 86399,
          },
        ],
      },
    },
  }) 


const stubRestDay = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-09',
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
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-28',
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
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-08',
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
      urlPattern: '/api/shifts/overtime/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-08',
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
      urlPattern: '/api/shifts/overtime/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-09',
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
      urlPattern: '/api/shifts/overtime/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-28',
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
      urlPattern: '/api/shifts/overtime/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-22',
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
      urlPattern: '/api/shifts/overtime/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-26',
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


const stubDayShift1 = () =>
  stubFor({
    priority: '1',
    request: {
      method: 'GET',
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-06',
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
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-23',
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
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-22',
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
      urlPattern: '/api/shifts/quantum/([a-zA-Z0-9_]*)/tasks\\?date=2020-03-26',
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

const stubNotifyStatus = async () =>
  stubFor({
    request: {
      method: 'GET',
      url: '/_status',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        status: 'ok',
      },
    },
  })

module.exports = {
  stubStaffLookup,
  stubTasks: () =>
    Promise.all([stubDayShift1(), stubDayShift2(), stubOvertimeDayShift1(), stubOvertimeDayShift2(), stubOvertimeDayShift3(), stubOvertimeDayShift4(), stubOvertimeDayShift5(), 
      stubOvertimeDayShift6(), stubNightShift1(), stubNightShift2(), stubNightShift3(), stubRestDay(), stubHoliday()]),
  stubShifts, 
  stubHealthCalls: () => Promise.all([stubHealth(), stubHealthInvision(), stubNotifyStatus()]),
}
