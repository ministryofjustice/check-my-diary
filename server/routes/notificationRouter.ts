import express from 'express'
import type { Router, Request, Response } from 'express'
import { body, check } from 'express-validator'
import NotificationSettingsController from '../controllers/notificationSettingsController'
import PostNotificationSettingsController from '../controllers/postNotificationSettingsController'
import NotificationController from '../controllers/notificationController'
import type { NotificationService } from '../services'

export default function notificationRouter(notificationService: NotificationService): Router {
  const notificationController = new NotificationController(notificationService)
  const notificationSettingsController = new NotificationSettingsController(notificationService)
  const postNotificationSettingsController = new PostNotificationSettingsController(notificationService)

  const router = express.Router({ mergeParams: true })

  router.get('/settings', (req, res) => notificationSettingsController.getSettings(req, res))

  router.post(
    '/settings',
    [
      body('contactMethod', 'Select if you want to receive notifications').isIn(['EMAIL', 'SMS', 'NONE']),

      body('inputEmail', 'Email address cannot be blank').if(body('contactMethod').equals('EMAIL')).notEmpty(),
      body('inputSMS', 'Phone number cannot be blank').if(body('contactMethod').equals('SMS')).notEmpty(),

      body('inputEmail', 'Enter an email address in the correct format, like name@example.com')
        .if(body('contactMethod').equals('EMAIL'))
        .if(body('inputEmail').notEmpty())
        .isEmail(),
      body('inputSMS', 'Enter a mobile phone number in the correct format')
        .if(body('contactMethod').equals('SMS'))
        .if(body('inputSMS').notEmpty())
        .blacklist(' ')
        .isMobilePhone('en-GB', { strictMode: false }),
    ],
    (req: Request, res: Response) => postNotificationSettingsController.setSettings(req, res),
  )

  router.post('/resume', (req, res) => notificationController.resume(req, res))
  router.get('/', (req, res) => notificationController.getNotifications(req, res))
  router.get('/manage', (req, res) => notificationController.getManage(req, res))
  router.get('/pause', (req, res) => notificationController.getPause(req, res))
  router.post(
    '/pause',
    [
      check('pauseValue', 'Enter a number').exists({ checkFalsy: true }).bail().isInt(),
      check('pauseValue', 'Enter a number above 0').if(check('pauseValue').isInt()).isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Select a period of time').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    (req: Request, res: Response) => notificationController.setPause(req, res),
  )

  return router
}
