const express = require('express')
const csrfTokenMiddleware = require('../middleware/csrfTokenMiddleware')

module.exports = ({ authenticationMiddleware }) => {
  return (routes) => {
    const router = express.Router()

    router.use(authenticationMiddleware)
    router.use(csrfTokenMiddleware)

    return routes(router)
  }
}
