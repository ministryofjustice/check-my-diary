const axios = require('axios')

/**
 * Get the staff member data from Elite2
 * @param eliteApi
 * @param accessToken
 * @returns {Promise<any>}
 */
const getStaffMemberData = async (eliteApi, accessToken) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${eliteApi}/api/users/me`, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        resolve(response.data)
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
            resolve(null)
          }
        } else {
          reject(error)
        }
      })
  })
}

module.exports = { getStaffMemberData }
