const logger = require('../../log')

module.exports = (req, res) => {
  logger.info('GET maintenance view')
  res.render('pages/maintenance', {
    uid: req.user.username,
    employeeName: req.user.employeeName,
    csrfToken: res.locals.csrfToken,
    authUrl: req.authUrl,
  })
}
