import { RequestHandler, Router } from 'express'
import { body, check } from 'express-validator'
import asyncMiddleware from '../middleware/asyncMiddleware'
import NotificationSettingsController from '../controllers/notificationSettingsController'

import PostNotificationSettingsController from '../controllers/postNotificationSettingsController'
import NotificationController from '../controllers/notificationController'

export default function notificationRouter(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidator = (path: string, handlers: Array<RequestHandler>, handler: RequestHandler) =>
    router.post(path, handlers, asyncMiddleware(handler))

  const notificationController = new NotificationController()
  const notificationSettingsController = new NotificationSettingsController()
  const postNotificationSettingsController = new PostNotificationSettingsController()

  get('/notifications/settings', notificationSettingsController.getSettings)

  postWithValidator(
    '/notifications/settings',
    [
      body('notificationRequired', 'Select if you want to receive notifications').isIn(['Yes', 'No']),

      body('inputEmail', 'Enter your email address').if(body('notificationRequired').equals('Yes')).notEmpty(),

      body('inputEmail', 'Enter an email address in the correct format, like name@example.com')
        .if(body('notificationRequired').equals('Yes'))
        .isEmail(),
    ],
    postNotificationSettingsController.setSettings,
  )

  post('/notifications/resume', notificationController.resume)
  get('/notifications', notificationController.getNotifications)
  get('/notifications/manage', notificationController.getManage)
  get('/notifications/pause', notificationController.getPause)
  postWithValidator(
    '/notifications/pause',
    [
      check('pauseValue', 'Enter a number').exists({ checkFalsy: true }).isInt(),
      check('pauseValue', 'Enter a number above 0').isInt({ min: 1, max: 99 }),
      check('pauseUnit', 'Select a period of time').exists({ checkFalsy: true }).isIn(['days', 'weeks', 'months']),
    ],
    notificationController.setPause,
  )

  return router
}
