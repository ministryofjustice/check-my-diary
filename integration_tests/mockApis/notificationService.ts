import { SuperAgentRequest } from 'superagent'
import { addDays, subDays, subHours, subMonths, subYears } from 'date-fns'
import { getMatchingRequests, stubFor } from './wiremock'

const now = Date.now()
const hours = subHours(now, 8.1).toISOString()
const days = subDays(now, 4.1).toISOString()
const months = subMonths(now, 2.1).toISOString()
const years = subYears(now, 3.1).toISOString()
const fakeShiftNotifications = [
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Paternity Leave].',
    shiftModified: hours,
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: days,
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Late Roll (OSG)].',
    shiftModified: months,
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: years,
    processed: true,
  },
]

export default {
  stubNotificationCount: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/notifications\\?processOnRead=false&unprocessedOnly=true',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: fakeShiftNotifications,
      },
    }),

  stubNotificationGet: (body?: object): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/notifications\\?processOnRead=true&unprocessedOnly=false',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: body || fakeShiftNotifications,
      },
    }),

  stubNotificationPreferencesGet: (body?: object): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/preferences/notifications2',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: body || {
          snoozeUntil: addDays(now, 3).toISOString().split('T')[0],
          preference: 'SMS',
          sms: '01189998819991197253',
        },
      },
    }),

  stubNotificationPreferencesGet404: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/preferences/notifications2',
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    }),

  stubNotificationPreferencesSet: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: '/preferences/notifications/details',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    }),

  stubNotificationUpdate: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: '/preferences/notifications/snooze',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    }),

  verifySnooze: async () =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: '/preferences/notifications/snooze',
      })
    ).body.requests,

  verifyDetails: async () =>
    (
      await getMatchingRequests({
        method: 'PUT',
        url: '/preferences/notifications/details',
      })
    ).body.requests,
}
