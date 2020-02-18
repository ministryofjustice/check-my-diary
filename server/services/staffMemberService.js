const axios = require('axios')
  
  /**
   * Get the staff member data for the given month (YYYY-MM-DD)
   * @param uid
   * @param startDate
   * @param accessToken
   * @returns {Promise<any>}
   */
  const getStaffMemberData = async (apiUrl, uid, startDate, accessToken) => {
  
    // @TODO: This is here to support the API call but is this really needed?
    // Get the end date by retrieving the last date of the current month
    function getEndDate() {
      const splitDate = startDate.split('-')
      return `${splitDate[0]}-${splitDate[1]}-${new Date(splitDate[0], splitDate[1], 0).getDate()}`
    } 

    return new Promise((resolve, reject) => {      
        axios.get(`${apiUrl}staff-members/quantum/${uid}?startdate=${startDate}&enddate=${getEndDate()}`, {        
        headers: {
          'authorization': `Bearer ${accessToken}`
        } 
      }      
      ).then((response) => {
        resolve(response.data)
      }).catch((error) => {
        if (error.response) {
          if (error.response.status === 404) {
            resolve(null)
          }
        }
        else {
          reject(error)
        }
      })
    })
  }

module.exports = { getStaffMemberData }