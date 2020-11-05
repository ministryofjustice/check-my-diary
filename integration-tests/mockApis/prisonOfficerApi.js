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

module.exports = {
  stubShifts,
}
