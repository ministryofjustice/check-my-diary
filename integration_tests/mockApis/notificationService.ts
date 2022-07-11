import { SuperAgentRequest } from 'superagent'
import moment from 'moment'
import { getMatchingRequests, stubFor } from './wiremock'

const hours = moment().add(-8, 'hours').format('YYYY-MM-DDTHH:mm:SS.000Z')
const days = moment().add(-4, 'days').format('YYYY-MM-DDTHH:mm:SS.000Z')
const months = moment().add(-2, 'month').format('YYYY-MM-DDTHH:mm:SS.000Z')
const years = moment().add(-3, 'years').format('YYYY-MM-DDTHH:mm:SS.000Z')
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
          snoozeUntil: moment().add(3, 'days').format('YYYY-MM-DD'),
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
