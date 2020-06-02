const { stubFor } = require('./wiremock')

const stubStaffLookup = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/api/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: {
        firstName: 'John',
        lastName: 'Smith',
      },
    },
  })

module.exports = {
  stubStaffLookup,
}
