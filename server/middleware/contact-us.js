const logger = require('../../log')

module.exports = (req, res) => {
  logger.info('GET contact-us view')
  res.render('pages/contact-us', {
    uid: req.user.username,
    employeeName: req.user.employeeName,
    csrfToken: res.locals.csrfToken,
    hmppsAuthMFAUser: req.hmppsAuthMFAUser,
    authUrl: req.authUrl,
  })
}
