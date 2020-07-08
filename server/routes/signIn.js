const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')
const csrfTokenMiddleware = require('../middleware/csrfTokenMiddleware')

module.exports = function createRouter() {
  const router = express.Router()

  router.use(csrfTokenMiddleware)

  router.get('/', (req, res) => {
    const errors = req.flash('error')
    res.render('login', { errors })
  })

  router.use(bodyParser.urlencoded({ extended: true }))

  router.post('/', (req, res) =>
    passport.authenticate('oauth2', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res),
  )

  return router
}
