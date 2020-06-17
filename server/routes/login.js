const { NotifyClient } = require('notifications-node-client')
const ipRangeCheck = require('ip-range-check')
const jwtDecode = require('jwt-decode')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const logError = require('../logError')
const config = require('../../config')
const utilities = require('../helpers/utilities')
const userAuthenticationService = require('../services/userAuthenticationService')

async function sendMFA(req, userAuthentication) {
  const twofactorCode = utilities.get2faCode()

  await userAuthenticationService.updateTwoFactorAuthenticationHash(
    req.user.username,
    utilities.createTwoFactorAuthenticationHash(twofactorCode.toString()),
  )

  const {
    notify: { url, clientKey, smsTemplateId, emailTemplateId },
  } = config
  const notify = url ? new NotifyClient(url, clientKey) : new NotifyClient(clientKey)

  if (userAuthentication.UseSms) {
    // For SMS
    await notify
      .sendSms(smsTemplateId, userAuthentication.Sms || '', {
        personalisation: { '2fa_code': twofactorCode },
      })
      .catch((err) => {
        throw new Error(err)
      })
  } else if (userAuthentication.UseEmailAddress) {
    // For email
    await notify
      .sendEmail(emailTemplateId, userAuthentication.EmailAddress || '', {
        personalisation: { '2fa_code': twofactorCode },
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
}

async function checkUserIsRegistered(req, res, userAuthenticationDetails) {
  if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
    const data = {
      id: req.user.username,
      authError: true,
      showUserNotSignedUpMessage: true,
      authErrorText: utilities.getAuthErrorDescription(
        `Error : No Sms or Email address returned for QuantumId : ${req.user.username}`,
      ),
      csrfToken: res.locals.csrfToken,
    }

    logError(req.url, data, 'Login failure')

    res.render('pages/index', data)
  }
  return userAuthenticationDetails
}

async function isQuantumIpAddress(req) {
  const ipAddress =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  const quantumAddresses = config.quantumAddresses.split(',')
  return ipRangeCheck(ipAddress, quantumAddresses)
}

const postLogin = asyncMiddleware(async (req, res) => {
  const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

  await checkUserIsRegistered(req, res, userAuthenticationDetails)

  const isHmppsAuthMFAUser = jwtDecode(req.user.token).authorities.includes('ROLE_MFA')
  const isQuantumIp = await isQuantumIpAddress(req)

  if (config.twoFactorAuthOn === 'true' && isHmppsAuthMFAUser === false && isQuantumIp === false) {
    await sendMFA(req, userAuthenticationDetails[0])

    res.render('pages/two-factor-auth', { authError: false, csrfToken: res.locals.csrfToken })
  } else {
    req.user.employeeName = jwtDecode(req.user.token).name

    await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
      req.user.username,
      new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000),
    )

    res.redirect(`/calendar/${utilities.getStartMonth()}`)
  }
})

module.exports = () => (router) => {
  router.get(
    '/',
    asyncMiddleware(async (req, res) => {
      postLogin(req, res)
    }),
  )

  router.get(
    '/auth/login',
    asyncMiddleware(async (req, res) => {
      postLogin(req, res)
    }),
  )

  router.post(
    '/auth/2fa',
    asyncMiddleware(async (req, res) => {
      const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

      const inputTwoFactorCode = utilities.createTwoFactorAuthenticationHash(req.body.code)

      if (inputTwoFactorCode === userAuthenticationDetails[0].TwoFactorAuthenticationHash) {
        req.user.employeeName = jwtDecode(req.user.token).name

        await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
          req.user.username,
          new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000),
        )

        res.redirect(`/calendar/${utilities.getStartMonth()}`)
      } else {
        logError(req.url, '2FA failure')
        res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
      }
    }),
  )

  return router
}
