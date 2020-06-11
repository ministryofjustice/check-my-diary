const { NotifyClient } = require('notifications-node-client')
const ipRangeCheck = require('ip-range-check')
const passport = require('passport')
const log = require('../../log')
const asyncMiddleware = require('../middleware/asyncMiddleware')
const logError = require('../logError')
const config = require('../../config')
const utilities = require('../helpers/utilities')
const staffMemberService = require('../services/staffMemberService')
const userAuthenticationService = require('../services/userAuthenticationService')

const {
  notify: { url, clientKey, smsTemplateId, emailTemplateId },
} = config
const notify = url ? new NotifyClient(url, clientKey) : new NotifyClient(clientKey)

const notifySmsTemplate = smsTemplateId || ''
const notifyEmailTemplate = emailTemplateId || ''

module.exports = () => (router) => {
  router.get('/', passport.authenticate('oauth2'), async (req, res) => {
    postLogin(req, res)
  })

  router.get('/auth/login', passport.authenticate('oauth2'), async (req, res) => {
    postLogin(req, res)
  })

  router.post(
    '/auth/2fa',
    asyncMiddleware(async (req, res) => {
      const userAuthentication = getUserDetails(req, res)
      const inputTwoFactorCode = utilities.createTwoFactorAuthenticationHash(req.body.code)
      if (inputTwoFactorCode === userAuthentication.TwoFactorAuthenticationHash) {
        await processLogin(req, userAuthentication)
        res.redirect(`/calendar/${utilities.getStartMonth()}`)
      } else {
        logError(req.url, '2FA failure')
        res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
      }
    }),
  )

  const postLogin = asyncMiddleware(async (req, res) => {
    const userAuthentication = getUserDetails(req, res)

    // Can we use Passport?
    // let token
    // if(req.user.token) {
    //  token = jwt.verify(req.user.token);
    // }

    // const token = passport.deserializeUser(req.user)

    log.info(req.user)
    if (
      // Users with ROLE_MFA have gone through the HMPPS auth MFA process
      req.user.token.authorities.includes('ROLE_MFA') === false &&
      config.twoFactorAuthOn === 'true' &&
      ipRangeCheck(getIpAddress(req), config.quantumAddresses.split(',')) === false
    ) {
      await sendMFACode(userAuthentication, req.user.username)
      res.render('pages/two-factor-auth', { authError: false, csrfToken: res.locals.csrfToken })
    } else {
      await processLogin(req, userAuthentication)
      res.redirect(`/calendar/${utilities.getStartMonth()}`)
    }
  })

  return router
}

function getIpAddress(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  )
}

function showErrorPage(req, res, userNotSignedUpMessage, error) {
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

async function processLogin(req, userAuthentication) {
  req.user.employeeName = await getStaffMemberEmployeeName(
    userAuthentication.ApiUrl,
    req.user.username,
    utilities.getStartMonth(),
    req.user.token,
  )

  await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
    req.user.username,
    new Date(Date.now() + config.hmppsCookie.expiryMinutes * 60 * 1000),
  )
}

async function getUserDetails(req, res) {
  const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

  if (userAuthenticationDetails === null || userAuthenticationDetails.length === 0) {
    showErrorPage(req, res, true, `Error : No Sms or Email address returned for QuantumId : ${req.user.username}`)
  }

  return userAuthenticationDetails[0]
}

async function sendMFACode(userAuthentication, userName) {
  const twoFactorCode = utilities.get2faCode()

  await userAuthenticationService.updateTwoFactorAuthenticationHash(
    userName,
    utilities.createTwoFactorAuthenticationHash(twoFactorCode.toString()),
  )

  if (
    (userAuthentication.EmailAddress === null || userAuthentication.EmailAddress === '') &&
    (userAuthentication.Sms === null || userAuthentication.Sms === '')
  ) {
    throw new Error(`Error : Sms or Email address null or empty for QuantumId : ${userName}`)
  }

  const emailEnabled = userAuthentication.UseEmailAddress
  const smsEnabled = userAuthentication.UseSms

  if (!emailEnabled && !smsEnabled) {
    throw new Error(`Error : Sms or Email address both set to false for QuantumId : ${userName}`)
  }

  if (emailEnabled) {
    // For email
    await notify
      .sendEmail(notifyEmailTemplate, userAuthentication.EmailAddress || '', {
        personalisation: { '2fa_code': twoFactorCode },
      })
      .catch((err) => {
        throw new Error(err)
      })
  } else if (smsEnabled) {
    // For SMS
    await notify
      .sendSms(notifySmsTemplate, userAuthentication.Sms || '', {
        personalisation: { '2fa_code': twoFactorCode },
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
}

async function getStaffMemberEmployeeName(apiUrl, uid, startMonth, accessToken) {
  const staffMemberResponse = await staffMemberService.getStaffMemberData(apiUrl, uid, startMonth, accessToken)

  if (staffMemberResponse !== null) {
    return staffMemberResponse.staffMembers[0].employeeName
  }
  return null
}
