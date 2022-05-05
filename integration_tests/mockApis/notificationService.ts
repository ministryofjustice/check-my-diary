import { SuperAgentRequest } from 'superagent'
import moment from 'moment'
import { stubFor } from './wiremock'

const fakeShiftNotifications = [
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Paternity Leave].',
    shiftModified: '2019-05-29T13:53:01.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: '2019-05-29T13:46:19.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 17:00 - 17:30 has changed to [Late Roll (OSG)].',
    shiftModified: '2019-05-29T13:43:37.000Z',
    processed: true,
  },
  {
    description: 'Your activity on Wednesday 29 May 2019 at 15:00 - 17:00 has changed to [FMI Training].',
    shiftModified: '2019-05-29T13:36:43.000Z',
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

  stubNotificationGet: (): SuperAgentRequest =>
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
        jsonBody: fakeShiftNotifications,
      },
    }),

  stubNotificationPreferencesGet: (): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/preferences/notifications',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: {
          snoozeUntil: moment().add(3, 'days').format('YYYY-MM-DD'),
          preference: 'SMS',
          sms: '01189998819991197253',
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
}
