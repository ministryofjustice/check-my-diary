import { SuperAgentRequest } from 'superagent'
import data from './calendar_data'
import { stubFor } from './wiremock'

export default {
  stubShifts: (): SuperAgentRequest =>
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
    }),
}
