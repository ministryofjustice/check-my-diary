const express = require('express')

module.exports = ({ authenticationMiddleware }) => {
  return routes => {
    const router = express.Router()

    router.use(authenticationMiddleware())
    router.use((req, res, next) => {
      if (typeof req.csrfToken === 'function') {
        res.locals.csrfToken = req.csrfToken()
      }
      next()
    })

    return routes(router)
  }
}
