import { SuperAgentRequest } from 'superagent'
import { addDays, subDays, subHours, subMonths, subYears } from 'date-fns'
import { getMatchingRequests, stubFor } from './wiremock'

const fakeShiftNotifications = () => [
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Paternity Leave].',
    shiftModified: subHours(new Date(), 8).toISOString(),
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: subDays(new Date(), 4).toISOString(),
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Late Roll (OSG)].',
    shiftModified: subMonths(new Date(), 2).toISOString(),
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: subYears(new Date(), 3).toISOString(),
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
        jsonBody: fakeShiftNotifications(),
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
        jsonBody: body || fakeShiftNotifications(),
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
          snoozeUntil: addDays(new Date(), 3).toISOString().split('T')[0],
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
