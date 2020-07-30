const moment = require('moment')
const config = require('../../config')

module.exports = (
  { user: { employeeName = '' } = { employeeName: '' }, hmppsAuthMFAUser = false, authUrl = '' },
  res,
  next,
) => {
  try {
    const {
      maintenance: { start, end },
    } = config
    if (start && end) {
      const maintenanceStartDateTime = moment(start)
      const maintenanceEndDateTime = moment(end)
      const currentDateTime = moment()
      if (
        currentDateTime.isSameOrAfter(maintenanceStartDateTime) &&
        currentDateTime.isSameOrBefore(maintenanceEndDateTime)
      ) {
        const formatString = 'hh:mm on dddd Do MMMM'
        return res.render('pages/maintenance', {
          startDateTime: maintenanceStartDateTime.format(formatString),
          endDateTime: maintenanceEndDateTime.format(formatString),
          csrfToken: res.locals.csrfToken,
          employeeName,
          hmppsAuthMFAUser,
          authUrl,
        })
      }
    }
    return next()
  } catch (error) {
    return next(error)
  }
}
