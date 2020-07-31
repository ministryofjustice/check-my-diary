const router = require('express').Router()
const { NotifyClient } = require('notifications-node-client')
const ipRangeCheck = require('ip-range-check')
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

const postLogin = async (req, res) => {
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
}

router.get('/login', postLogin)

router.post('/2fa', async (req, res) => {
  try {
    const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

    const inputTwoFactorCode = utilities.createTwoFactorAuthenticationHash(req.body.code)

    if (inputTwoFactorCode === userAuthenticationDetails[0].TwoFactorAuthenticationHash) {
      await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
        req.user.username,
        new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000),
      )

      res.redirect(`/calendar/${utilities.getStartMonth()}`)
    } else {
      logError(req.url, '2FA failure')
      res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
    }
  } catch (error) {
    logError(req.url, '2FA failure')
    res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
  }
})

module.exports = router
