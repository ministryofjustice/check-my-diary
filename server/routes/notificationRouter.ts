import { RequestHandler, Router } from 'express'
import { body, check } from 'express-validator'
import asyncMiddleware from '../middleware/asyncMiddleware'
import NotificationSettingsController from '../controllers/notificationSettingsController'
import PostNotificationSettingsController from '../controllers/postNotificationSettingsController'
import NotificationController from '../controllers/notificationController'
import type { NotificationService } from '../services'

export default function notificationRouter(router: Router, notificationService: NotificationService): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidator = (path: string, handlers: Array<RequestHandler>, handler: RequestHandler) =>
    router.post(path, handlers, asyncMiddleware(handler))

  const notificationController = new NotificationController(notificationService)
  const notificationSettingsController = new NotificationSettingsController(notificationService)
  const postNotificationSettingsController = new PostNotificationSettingsController(notificationService)

  get('/notifications/settings', (req, res) => notificationSettingsController.getSettings(req, res))

  postWithValidator(
    '/notifications/settings',
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
    (req, res) => postNotificationSettingsController.setSettings(req, res),
  )

  post('/notifications/resume', (req, res) => notificationController.resume(req, res))
  get('/notifications', (req, res) => notificationController.getNotifications(req, res))
  get('/notifications/manage', (req, res) => notificationController.getManage(req, res))
  get('/notifications/pause', (req, res) => notificationController.getPause(req, res))
  postWithValidator(
    '/notifications/pause',
    [
      check('pauseValue', 'Enter a number').exists({ checkFalsy: true }).bail().isInt(),
      check('pauseValue', 'Enter a number above 0').if(check('pauseValue').isInt()).isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Select a period of time').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    (req, res) => notificationController.setPause(req, res),
  )

  return router
}
