const { stubFor, getMatchingRequests } = require('./wiremock')

const getNotificationCalls = async () => {
  const requests = await getMatchingRequests({
    method: 'POST',
    urlPattern: '/v2/notifications.*',
  })

  return requests.body.requests.map((r) => JSON.parse(r.body))
}

const stubNotifications = async () =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/v2/notifications.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    },
  })

const stubStatus = async () =>
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
  stubStatus,
  stubNotifications,
  getNotificationCalls,
}
