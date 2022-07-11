import { RequestHandler, Router } from 'express'
import { body, check } from 'express-validator'
import asyncMiddleware from '../middleware/asyncMiddleware'
import NotificationSettingsController from '../controllers/notificationSettingsController'
import PostNotificationSettingsController from '../controllers/postNotificationSettingsController'
import NotificationController from '../controllers/notificationController'
import type { Services } from '../services'

export default function notificationRouter(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidator = (path: string, handlers: Array<RequestHandler>, handler: RequestHandler) =>
    router.post(path, handlers, asyncMiddleware(handler))

  const notificationController = new NotificationController(services.notificationService)
  const notificationSettingsController = new NotificationSettingsController(services.notificationService)
  const postNotificationSettingsController = new PostNotificationSettingsController(services.notificationService)

  get('/notifications/settings', (req, res) => notificationSettingsController.getSettings(req, res))

  postWithValidator(
    '/notifications/settings',
    [
      body('notificationRequired', 'Select if you want to receive notifications').isIn(['Yes', 'No']),

      body('inputEmail', 'Email address cannot be blank').if(body('notificationRequired').equals('Yes')).notEmpty(),

      body('inputEmail', 'Enter an email address in the correct format, like name@example.com')
        .if(body('notificationRequired').equals('Yes'))
        .isEmail(),
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
      check('pauseValue', 'Enter a number').exists({ checkFalsy: true }).isInt(),
      check('pauseValue', 'Enter a number above 0').isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Select a period of time').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    (req, res) => notificationController.setPause(req, res),
  )

  return router
}
