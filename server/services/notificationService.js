const axios = require('axios')
const logger = require('../../log')

module.exports = function notificationService() {
  function get(notificationServiceUrl, accessToken) {
    return axios
      .get(`${notificationServiceUrl}`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .catch((error) => {
        logger.error(`notificationService : ${error}`)
        return error
      })
  }

  return {
    get,
  }
}
