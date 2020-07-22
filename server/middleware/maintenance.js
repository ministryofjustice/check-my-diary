const logger = require('../../log')

module.exports = (req, res) => {
  logger.info('GET maintenance view')
  res.render('pages/maintenance', {
    employeeName: req.user.employeeName,
    csrfToken: res.locals.csrfToken,
    hmppsAuthMFAUser: req.hmppsAuthMFAUser,
    authUrl: req.authUrl,
  })
}
