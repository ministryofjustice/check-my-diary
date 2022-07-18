import { NextFunction, Request, Response, Router } from 'express'
import { NotifyClient } from 'notifications-node-client'
import ipRangeCheck from 'ip-range-check'

import logError from '../logError'
import log from '../../log'
import config from '../config'
import utilities from '../helpers/utilities'
import type { UserAuthenticationService } from '../services'
import sanitiseError from '../sanitisedError'

const processError = (error: Error, req: Request, res: Response) => {
  const data = {
    response: res,
    stack: error.stack,
    message: req.user.username,
    id: req.user.username,
    authError: true,
    authErrorText: utilities.getAuthErrorDescription(error),
  }

  logError(req.url, data, 'Login failure')

  res.render('pages/index.njk', data)
}

export default function loginRouter(userAuthenticationService: UserAuthenticationService): Router {
  const router = Router()
  const {
    notify: { url, clientKey, smsTemplateId, emailTemplateId },
  } = config
  const notify = url ? new NotifyClient(url, clientKey) : new NotifyClient(clientKey)

  const notifySmsTemplate = smsTemplateId || ''
  const notifyEmailTemplate = emailTemplateId || ''

  const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

    // break out for auth users
    if (req.hmppsAuthMFAUser || userAuthenticationDetails.length === 0) {
      res.redirect(`/calendar/${utilities.getStartMonth()}#today`)
      return
    }

    const ipAddress = req.get('x-forwarded-for') || req.socket.remoteAddress || ''

    try {
      const quantumAddresses = config.quantumAddresses.split(',')
      if (config.twoFactorAuthOn === 'true' && !ipRangeCheck(ipAddress, quantumAddresses)) {
        // eslint-disable-next-line no-shadow
        const userAuthentication = userAuthenticationDetails[0]

        if (
          (userAuthentication.EmailAddress === null || userAuthentication.EmailAddress === '') &&
          (userAuthentication.Sms === null || userAuthentication.Sms === '')
        ) {
          processError(
            new Error(`Error : Sms or Email address null or empty for QuantumId : ${req.user.username}`),
            req,
            res,
          )
          return
        }

        const emailEnabled = userAuthentication.UseEmailAddress
        const smsEnabled = userAuthentication.UseSms

        if (!emailEnabled && !smsEnabled) {
          processError(
            new Error(`Error : Sms or Email address both set to false for QuantumId : ${req.user.username}`),
            req,
            res,
          )
          return
        }

        const twofactorCode = utilities.get2faCode()

        await userAuthenticationService.updateTwoFactorAuthenticationHash(
          req.user.username,
          utilities.createTwoFactorAuthenticationHash(twofactorCode.toString()),
        )

        if (smsEnabled) {
          await notify
            .sendSms(notifySmsTemplate, userAuthentication.Sms || '', {
              personalisation: { '2fa_code': twofactorCode },
            })
            .catch((err: string) => {
              throw new Error(err)
            })
        }

        if (emailEnabled) {
          await notify
            .sendEmail(notifyEmailTemplate, userAuthentication.EmailAddress || '', {
              personalisation: { '2fa_code': twofactorCode },
            })
            .catch((err: string) => {
              throw new Error(err)
            })
        }

        res.render('pages/two-factor-auth', { authError: false, csrfToken: res.locals.csrfToken })
      } else {
        await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
          req.user.username,
          new Date(Date.now() + config.session.expiryMinutes * 60 * 1000),
        )

        res.redirect(`/calendar/${utilities.getStartMonth()}#today`)
      }
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      log.error(sanitisedError, `Unexpected login error, user = ${res.locals.user}`)
      next(sanitisedError)
    }
  }

  router.get('/login', postLogin)

  router.post('/2fa', async (req: Request, res: Response) => {
    try {
      const userAuthenticationDetails = await userAuthenticationService.getUserAuthenticationDetails(req.user.username)

      const inputTwoFactorCode = utilities.createTwoFactorAuthenticationHash(req.body.code)
      const userAuthentication = userAuthenticationDetails[0]

      if (userAuthentication && inputTwoFactorCode === userAuthentication.TwoFactorAuthenticationHash) {
        await userAuthenticationService.updateUserSessionExpiryAndLastLoginDateTime(
          req.user.username,
          new Date(Date.now() + config.session.expiryMinutes * 60 * 1000),
        )
        log.info(
          `2FA login success for ${req.user.username} and useSMS=${userAuthentication.UseSms}, useEmail=${userAuthentication.UseEmailAddress}`,
        )

        res.redirect(`/calendar/${utilities.getStartMonth()}#today`)
      } else {
        logError(req.url, { response: res, stack: {}, message: req.user.username }, '2FA failure: code does not match')
        res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
      }
    } catch (error) {
      logError(
        req.url,
        { response: res, stack: error.stack, message: req.user.username },
        `2FA failure: error=${error.message}`,
      )
      res.render('pages/two-factor-auth', { authError: true, csrfToken: res.locals.csrfToken })
    }
  })

  return router
}
