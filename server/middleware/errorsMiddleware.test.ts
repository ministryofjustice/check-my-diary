import type { Response } from 'express'
import errorsMiddleware from './errorsMiddleware'

jest.mock('../../config', () => ({
  maintenance: { start: '1979-10-12T07:28:00.000Z', end: '1979-10-12T10:28:00.000Z' },
}))

describe('errors middleware', () => {
  const nextMock = jest.fn()
  const renderMock = jest.fn()
  const statusMock = jest.fn()
  const stack = 'FULL'
  const status = 418
  const userMessage = 'Teapot fun'
  let mrError: Error
  let res: Response
  beforeEach(() => {
    mrError = Object.assign(new Error('SQUIRREL!'), { stack, status, userMessage })
    res = { status: statusMock, render: renderMock, locals: {} } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('with a non production error', () => {
    beforeEach(() => {
      errorsMiddleware(mrError, {}, res, nextMock)
    })
    it('should render the errors page', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/error', { stack, message: userMessage, status })
    })
    it('should not call next', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should set the page status', () => {
      expect(statusMock).toHaveBeenCalledTimes(1)
      expect(statusMock).toHaveBeenCalledWith(status)
    })
  })
  describe('with a production error', () => {
    let processNodeEnv: string | undefined
    beforeEach(() => {
      processNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      errorsMiddleware(mrError, {}, res, nextMock)
    })
    afterEach(() => {
      process.env.NODE_ENV = processNodeEnv
    })
    it('should render the errors page without the stack', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/error', { stack: null, message: userMessage, status })
    })
    it('should not call next', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
    it('should set the page status', () => {
      expect(statusMock).toHaveBeenCalledTimes(1)
      expect(statusMock).toHaveBeenCalledWith(status)
    })
  })
})
