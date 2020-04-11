/* eslint-disable */

const nunjucks = require('nunjucks')
const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const path = require('path')

module.exports = (route) => {
  const app = express()

  app.set('views', path.join(__dirname, '../../views'))
  app.set('view engine', 'ejs')

  app.use((req, res, next) => {
    ;(req.user = {
      firstName: 'first',
      lastName: 'last',
      userId: 'id',
      token: 'token',
      username: 'user1',
    }),
      next()
  })
  app.use(cookieSession({ keys: [''] }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/', route)
  app.use((error, req, res, next) => {
    console.log(error)
  })
  return app
}
