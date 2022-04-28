const moment = require('moment')
const config = require('../../config')

module.exports = ({ user: { employeeName = '' } = { employeeName: '' }, authUrl = '' }, res, next) => {
  try {
    const {
      maintenance: { start, end },
    } = config
    if (start && end) {
      const maintenanceStartDateTime = moment(start, 'YYYY-MM-DD HH:mm:ss')
      const maintenanceEndDateTime = moment(end, 'YYYY-MM-DD HH:mm:ss')
      const currentDateTime = moment()
      if (
        currentDateTime.isSameOrAfter(maintenanceStartDateTime) &&
        currentDateTime.isSameOrBefore(maintenanceEndDateTime)
      ) {
        const formatString = 'HH:mm on dddd Do MMMM'
        return res.render('pages/maintenance', {
          startDateTime: maintenanceStartDateTime.format(formatString),
          endDateTime: maintenanceEndDateTime.format(formatString),
          csrfToken: res.locals.csrfToken,
          employeeName,
          authUrl,
        })
      }
    }
    return next()
  } catch (error) {
    return next(error)
  }
}
