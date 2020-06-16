const { NotifyClient } = require('notifications-node-client')
const ipRangeCheck = require('ip-range-check')
const jwtDecode = require('jwt-decode')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const logError = require('../logError')
const config = require('../../config')
const utilities = require('../helpers/utilities')
const userAuthenticationService = require('../services/userAuthenticationService')

const {
  notify: { url, clientKey, smsTemplateId, emailTemplateId },
} = config
const notify = url ? new NotifyClient(url, clientKey) : new NotifyClient(clientKey)

const notifySmsTemplate = smsTemplateId || ''
const notifyEmailTemplate = emailTemplateId || ''

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

  const postLogin = asyncMiddleware(async (req, res) => {
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null)

    let userNotSignedUpMessage = false

    try {
      const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

      if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
        userNotSignedUpMessage = true
        throw new Error(`Error : No Sms or Email address returned for QuantumId : ${req.user.username}`)
      }

      const quantumAddresses = config.quantumAddresses.split(',')
      const hmppsAuthMFAUser = jwtDecode(req.user.token).authorities.includes('ROLE_MFA')
      if (
        hmppsAuthMFAUser === false &&
        config.twoFactorAuthOn === 'true' &&
        ipRangeCheck(ipAddress, quantumAddresses) === false
      ) {
        // eslint-disable-next-line no-shadow
        const userAuthentication = userAuthenticationDetails[0]

        const emailEnabled = userAuthentication.UseEmailAddress
        const smsEnabled = userAuthentication.UseSms

        const twofactorCode = utilities.get2faCode()

        await userAuthenticationService.updateTwoFactorAuthenticationHash(
          req.user.username,
          utilities.createTwoFactorAuthenticationHash(twofactorCode.toString()),
        )

        if (smsEnabled) {
          // For SMS
          await notify
            .sendSms(notifySmsTemplate, userAuthentication.Sms || '', {
              personalisation: { '2fa_code': twofactorCode },
            })
            .catch((err) => {
              throw new Error(err)
            })
        } else if (emailEnabled) {
          // For email
          await notify
            .sendEmail(notifyEmailTemplate, userAuthentication.EmailAddress || '', {
              personalisation: { '2fa_code': twofactorCode },
            })
            .catch((err) => {
              throw new Error(err)
            })
        }

        res.render('pages/two-factor-auth', { authError: false, csrfToken: res.locals.csrfToken })
      } else {
        req.user.employeeName = jwtDecode(req.user.token).name

        await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
          req.user.username,
          new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000),
        )

        res.redirect(`/calendar/${utilities.getStartMonth()}`)
      }
    } catch (error) {
      const data = {
        id: req.user.username,
        authError: true,
        showUserNotSignedUpMessage: userNotSignedUpMessage,
        authErrorText: utilities.getAuthErrorDescription(error),
        csrfToken: res.locals.csrfToken,
      }

      logError(req.url, data, 'Login failure')

      res.render('pages/index', data)
    }
  })

  return router
}
