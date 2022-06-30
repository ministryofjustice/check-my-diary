import type { Request, Response } from 'express'

import config from '../../config'
import auth from './auth'

jest.mock('jwt-decode', () => () => ({ name: 'Ned Nederlander' }))
jest.mock('../helpers/utilities')
jest.mock('../../config', () => ({ apis: { hmppsAuth: {} } }))

describe('authentication middleware', () => {
  const nextMock = jest.fn()
  const redirectMock = jest.fn()
  const isAuthenticatedMock = jest.fn().mockReturnValue(false)
  const token = 'the singing bush'
  const authUrl = 'www.gov.uk'
  config.apis.hmppsAuth.url = authUrl
  let req: Request
  let res: Response
  beforeEach(() => {
    req = { isAuthenticated: isAuthenticatedMock, user: { token } } as unknown as Request
    res = { redirect: redirectMock } as unknown as Response
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with an authenticated user', () => {
    beforeEach(() => {
      isAuthenticatedMock.mockReturnValueOnce(true)
      auth.authenticationMiddleware()(req, res, nextMock)
    })
    it('should call isAuthenticated', () => {
      expect(isAuthenticatedMock).toBeCalledTimes(1)
    })
    it('should call next', () => {
      expect(nextMock).toBeCalledTimes(1)
    })
    it('should not call redirect', () => {
      expect(redirectMock).not.toBeCalled()
    })
  })
  describe('with an unauthenticated user', () => {
    const originalUrl = 'https://www.gov.uk/government/organisations/ministry-of-justice'
    beforeEach(() => {
      req.originalUrl = originalUrl
      req.session = {} as unknown as Request['session']
      auth.authenticationMiddleware()(req, res, nextMock)
    })
    it('should call isAuthenticated', () => {
      expect(isAuthenticatedMock).toBeCalledTimes(1)
    })
    it('should not call next', () => {
      expect(nextMock).not.toBeCalled()
    })
    it('should call redirect with the login page', () => {
      expect(redirectMock).toBeCalledTimes(1)
      expect(redirectMock).toBeCalledWith('/login')
    })
    it('should populate req.session.returnTo', () => {
      expect(req).toEqual({
        originalUrl,
        isAuthenticated: isAuthenticatedMock,
        session: { returnTo: originalUrl },
        user: { token },
      })
    })
  })
})
