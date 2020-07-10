const router = require('express').Router()
const logger = require('../../log')

router.get('/', (req, res) => {
  logger.info('GET maintenance view')
  res.render('pages/maintenance', {
    uid: req.user.username,
    employeeName: req.user.employeeName,
    csrfToken: res.locals.csrfToken,
    hmppsAuthMFAUser: req.hmppsAuthMFAUser,
    authUrl: req.authUrl,
  })
})

module.exports = router
