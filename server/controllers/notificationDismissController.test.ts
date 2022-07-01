import { Request, Response } from 'express'
import { NotificationCookieService } from '../services'
import NotificationDismissController from './notificationDismissController'

describe('Notification dismiss', () => {
  const markAsDismissedMock = jest.fn()
  const notificationCookieService = { markAsDismissed: markAsDismissedMock } as unknown as NotificationCookieService
  const notificationDismissController = new NotificationDismissController(notificationCookieService)

  const req: Request = {} as unknown as Request
  const res: Response = {
    status: jest.fn(),
    end: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should redirect when the request is not an ajax type request', async () => {
    await notificationDismissController.dismiss(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/')
  })

  it('should respond with a bad request when there is missing post data', async () => {
    req.xhr = true

    await notificationDismissController.dismiss(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.end).toHaveBeenCalled()
  })

  it('should call notification cookie with the correct parameters', async () => {
    req.xhr = true
    req.body = { id: 'data' }

    await notificationDismissController.dismiss(req, res)

    expect(markAsDismissedMock).toHaveBeenCalledWith(res, 'data')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.end).toHaveBeenCalled()
  })
})
