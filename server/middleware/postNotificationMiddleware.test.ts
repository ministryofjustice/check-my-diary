import type { Response } from 'express'
import postNotificationMiddleware from './postNotificationMiddleware'
import { AppRequest } from '../helpers/utilities.types'

describe('post notification middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'sausages'
  const csrfToken = 'tomato'
  const updateSnoozeMock = jest.fn()
  const app = { get: () => ({ notificationService: { updateSnooze: updateSnoozeMock } }) }
  let req: AppRequest
  let res: Response
  beforeEach(() => {
    req = { user: { token }, body: { pauseUnit: 'days', pauseValue: 3 }, app } as unknown as AppRequest
    res = { render: renderMock, locals: { csrfToken } } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with valid data', () => {
    beforeEach(() => {
      postNotificationMiddleware(req, res, nextMock)
    })
    it('should update the snooze time by calling the "updateSnooze" method on the "notificationService"', () => {
      expect(updateSnoozeMock).toHaveBeenCalledTimes(1)
    })
    it('should call the next function once', () => {
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
    it('should not call the render function', () => {
      expect(renderMock).not.toHaveBeenCalled()
    })
  })
})
