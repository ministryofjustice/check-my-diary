const { stubFor } = require('./wiremock')

const stubNotificationService = async () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/notifications-service',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        testEndpoint: true,
      },
    },
  })

module.exports = stubNotificationService
