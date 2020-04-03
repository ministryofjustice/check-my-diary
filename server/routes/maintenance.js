module.exports = (logger) => (router) => {
  router.get('/', (req, res) => {
    logger.info('GET maintenance view')
    res.render('pages/maintenance', {
      uid: req.user.username,
      employeeName: req.user.employeeName,
      csrfToken: res.locals.csrfToken,
    })
  })

  return router
}
