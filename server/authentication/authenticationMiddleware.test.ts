import type { Request, Response } from 'express'

import config from '../config'
import auth from './auth'

jest.mock('jwt-decode', () => () => ({ name: 'Ned Nederlander' }))
jest.mock('../helpers/utilities')
jest.mock('../config', () => ({ apis: { hmppsAuth: {} } }))

describe('authentication middleware', () => {
  const nextMock = jest.fn()
  const redirectMock = jest.fn()
  const isAuthenticatedMock = jest.fn()
  const tokenVerifierMock = jest.fn()
  const token = 'the singing bush'
  const originalUrl = 'https://www.gov.uk/government/organisations/ministry-of-justice'
  config.apis.hmppsAuth.url = 'www.gov.uk'
  let req: Request
  let res: Response
  beforeEach(() => {
    req = { isAuthenticated: isAuthenticatedMock, user: { token } } as unknown as Request
    res = { redirect: redirectMock } as unknown as Response
    req.originalUrl = originalUrl
    req.session = {} as unknown as Request['session']
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with an authenticated user', () => {
    beforeEach(() => {
      isAuthenticatedMock.mockReturnValueOnce(true)
      tokenVerifierMock.mockReturnValueOnce(true)
      auth.authenticationMiddleware(tokenVerifierMock)(req, res, nextMock)
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
  describe('with an authenticated user with invalid token', () => {
    beforeEach(() => {
      isAuthenticatedMock.mockReturnValueOnce(true)
      tokenVerifierMock.mockReturnValueOnce(false)
      auth.authenticationMiddleware(tokenVerifierMock)(req, res, nextMock)
    })
    it('should call verifyToken', () => {
      expect(tokenVerifierMock).toBeCalledTimes(1)
    })
    it('should not call next', () => {
      expect(nextMock).not.toBeCalled()
    })
    it('should call redirect with the login page', () => {
      expect(redirectMock).toBeCalledTimes(1)
      expect(redirectMock).toBeCalledWith('/login')
    })
  })
  describe('with an unauthenticated user', () => {
    beforeEach(() => {
      isAuthenticatedMock.mockReturnValueOnce(false)
      tokenVerifierMock.mockReturnValueOnce(false)
      auth.authenticationMiddleware(tokenVerifierMock)(req, res, nextMock)
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
