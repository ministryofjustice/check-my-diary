const { stubFor } = require('./wiremock')

const stubNotificationGet = async () =>
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
        snoozeUntil: '2020-08-27',
      },
    },
  })

const stubNotificationUpdate = async () =>
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
  })

module.exports = {
  stubNotificationGet,
  stubNotificationUpdate,
}
