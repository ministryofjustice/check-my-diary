import type { Response, Request } from 'express'
import { markAsDismissed, alreadyDismissed } from './notificationCookieService'

describe('Notification cookie', () => {
  let res: Response
  let req: Request

  beforeEach(() => {
    res = { cookie: jest.fn() } as unknown as Response
    req = { cookies: { 'ui-notification-banner-ID1': 'dismissed' } } as unknown as Request
  })

  it('should store cookie correctly', () => {
    markAsDismissed(res, 'ID1')
    expect(res.cookie).toHaveBeenCalledWith('ui-notification-banner-ID1', 'dismissed', {
      httpOnly: true,
      maxAge: 4492800000,
    })
  })

  it('should find matching cookie', () => {
    expect(alreadyDismissed(req, 'ID1')).toBeTruthy()
  })

  it('should NOT find matching cookie', () => {
    expect(alreadyDismissed(req, 'ID2')).toBeFalsy()
  })
})
