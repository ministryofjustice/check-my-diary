const router = require('express').Router()
const { NotifyClient } = require('notifications-node-client')
const ipRangeCheck = require('ip-range-check')
const jwtDecode = require('jwt-decode')
const moment = require('moment')
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
  try {
    if (!utilities.isNullOrEmpty(config.maintenance.start) && !utilities.isNullOrEmpty(config.maintenance.end)) {
      // eslint-disable-next-line vars-on-top
      const maintenanceStartDateTime = moment(config.maintenance.start)
      const maintenanceEndDateTime = moment(config.maintenance.end)
      const currentDateTime = moment()
      if (
        currentDateTime.isSameOrAfter(maintenanceStartDateTime) &&
        currentDateTime.isSameOrBefore(maintenanceEndDateTime)
      ) {
        res.render('pages/maintenance', {
          startDateTime: maintenanceStartDateTime.format('hh:mm on dddd Do MMMM'),
          endDateTime: maintenanceEndDateTime.format('hh:mm on dddd Do MMMM'),
          csrfToken: res.locals.csrfToken,
        })
        return
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-undef
    logError(req.url, data, 'Login failure')
  }

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
    if (
      !utilities.hmppsAuthMFAUser(req.user.token) &&
      config.twoFactorAuthOn === 'true' &&
      ipRangeCheck(ipAddress, quantumAddresses) === false
    ) {
      if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
        throw new Error(`Error : No Sms or Email address returned for QuantumId : ${req.user.username}`)
      }

      // eslint-disable-next-line no-shadow
      const userAuthentication = userAuthenticationDetails[0]

      if (
        (userAuthentication.EmailAddress === null || userAuthentication.EmailAddress === '') &&
        (userAuthentication.Sms === null || userAuthentication.Sms === '')
      ) {
        throw new Error(`Error : Sms or Email address null or empty for QuantumId : ${req.user.username}`)
      }

      const emailEnabled = userAuthentication.UseEmailAddress
      const smsEnabled = userAuthentication.UseSms

      if (!emailEnabled && !smsEnabled) {
        throw new Error(`Error : Sms or Email address both set to false for QuantumId : ${req.user.username}`)
      }

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

module.exports = router
