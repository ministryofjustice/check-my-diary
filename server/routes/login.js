const { NotifyClient } = require('notifications-node-client')
const ipRangeCheck = require('ip-range-check')
const jwtDecode = require('jwt-decode')
const logError = require('../logError')
const config = require('../../config')
const utilities = require('../helpers/utilities')
const userAuthenticationService = require('../services/userAuthenticationService')

module.exports = () => (router) => {
  const postLogin = (req, res) => {
    try {
      const userAuthenticationDetails = userAuthenticationService.getUserAuthenticationDetails(req.user.username)

      if (
        userHasRole(req.user.token, 'ROLE_MFA') === false &&
        isQuantumAddress(req) === false &&
        config.twoFactorAuthOn === 'true'
      ) {
        sendMFA(req.user.username, userAuthenticationDetails[0])
        res.render('pages/two-factor-auth', { authError: false, csrfToken: res.locals.csrfToken })
      } else {
        processLogin(req)
        res.redirect(`/calendar/${utilities.getStartMonth()}`)
      }
    } catch (error) {
      const data = {
        id: req.user.username,
        authError: true,
        showUserNotSignedUpMessage: false,
        apiUp: true,
        authErrorText: utilities.getAuthErrorDescription(error),
        csrfToken: res.locals.csrfToken,
      }

      logError(req.url, data, 'Login failure')

      res.render('pages/index', data)
    }
  }

  router.get('/', postLogin)

  router.get('/auth/login', postLogin)

  router.post('/auth/2fa', (req, res) => {
    if (validateMFA(req.body.code, req.user.username) === true) {
      processLogin(req)
      res.redirect(`/calendar/${utilities.getStartMonth()}`)
    } else {
      logError(req.url, '2FA failure')
      res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
    }
  })
  return router
}

function processLogin(req) {
  req.user.employeeName = jwtDecode(req.user.token).name
  userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
    req.user.username,
    new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000),
  )
}

function validateMFA(code, username) {
  const userDetails = userAuthenticationService.getUserAuthenticationDetails(username)[0]
  return utilities.createTwoFactorAuthenticationHash(code) === userDetails.TwoFactorAuthenticationHash
}

function userHasRole(token, role) {
  jwtDecode(token).authorities.includes(role)
}

function isQuantumAddress(req) {
  return ipRangeCheck(getIpAddress(req), config.quantumAddresses.split(','))
}

function getIpAddress(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  )
}

function sendMFA(userName, userAuthentication) {
  const twofactorCode = utilities.get2faCode()

  userAuthenticationService.updateTwoFactorAuthenticationHash(
    userName,
    utilities.createTwoFactorAuthenticationHash(twofactorCode.toString()),
  )

  const {
    notify: { url, clientKey, smsTemplateId, emailTemplateId },
  } = config
  const notify = url ? new NotifyClient(url, clientKey) : new NotifyClient(clientKey)

  if (userAuthentication.UseSms) {
    // For SMS
    notify
      .sendSms(smsTemplateId, userAuthentication.Sms || '', {
        personalisation: { '2fa_code': twofactorCode },
      })
      .catch((err) => {
        throw new Error(err)
      })
  } else if (userAuthentication.UseEmailAddress) {
    // For email
    notify
      .sendEmail(emailTemplateId, userAuthentication.EmailAddress || '', {
        personalisation: { '2fa_code': twofactorCode },
      })
      .catch((err) => {
        throw new Error(err)
      })
  } else {
    throw new Error(`Error : Sms or Email address both set to false for QuantumId : ${userName}`)
  }
}
