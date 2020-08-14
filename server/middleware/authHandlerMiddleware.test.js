const authHandlerMiddleware = require('./authHandlerMiddleware')

describe('auth handler middleware', () => {
  const nextMock = jest.fn()
  const redirectMock = jest.fn()
  const getSessionExpiryDateTimeMock = jest.fn()
  const app = { get: () => ({ userAuthenticationService: { getSessionExpiryDateTime: getSessionExpiryDateTimeMock } }) }
  const username = 'Agrajag'
  let req
  let res

  beforeEach(() => {
    res = { redirect: redirectMock }
    req = { app, user: { username } }
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('1979-10-12T08:28:00.000Z').getTime())
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with an "hmppsAuthMFAUser" user', () => {
    beforeEach(() => {
      req.hmppsAuthMFAUser = true
      authHandlerMiddleware(req, res, nextMock)
    })
    it('should not redirect', () => {
      expect(redirectMock).not.toHaveBeenCalled()
    })
    it('should call next', () => {
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
  })
  describe('with a current session', () => {
    beforeEach(() => {
      getSessionExpiryDateTimeMock.mockResolvedValueOnce([{ SessionExpiryDateTime: '1979-10-12T08:29:00.000Z' }])
      authHandlerMiddleware(req, res, nextMock)
    })
    it('should call "getSessionExpiryDate" with the username', () => {
      expect(getSessionExpiryDateTimeMock).toHaveBeenCalledTimes(1)
      expect(getSessionExpiryDateTimeMock).toHaveBeenCalledWith(username)
    })
    it('should not redirect', () => {
      expect(redirectMock).not.toHaveBeenCalled()
    })
    it('should call next', () => {
      expect(nextMock).toHaveBeenCalledTimes(1)
    })
  })
  describe('with an expired session', () => {
    beforeEach(() => {
      getSessionExpiryDateTimeMock.mockResolvedValueOnce([{ SessionExpiryDateTime: '1979-10-12T08:27:00.000Z' }])
      authHandlerMiddleware(req, res, nextMock)
    })
    it('should call "getSessionExpiryDate" with the username', () => {
      expect(getSessionExpiryDateTimeMock).toHaveBeenCalledTimes(1)
      expect(getSessionExpiryDateTimeMock).toHaveBeenCalledWith(username)
    })
    it('should redirect to the 2fa route', () => {
      expect(redirectMock).toHaveBeenCalledTimes(1)
      expect(redirectMock).toHaveBeenCalledWith('/auth/login')
    })
    it('should not call next', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with no session found', () => {
    beforeEach(() => {
      getSessionExpiryDateTimeMock.mockResolvedValueOnce([{ SessionExpiryDateTime: null }])
      authHandlerMiddleware(req, res, nextMock)
    })
    it('should not call "getSessionExpiryDate" with the username', () => {
      expect(getSessionExpiryDateTimeMock).toHaveBeenCalledTimes(1)
      expect(getSessionExpiryDateTimeMock).toHaveBeenCalledWith(username)
    })
    it('should redirect to the 2fa route', () => {
      expect(redirectMock).toHaveBeenCalledTimes(1)
      expect(redirectMock).toHaveBeenCalledWith('/auth/login')
    })
    it('should not call next', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with no entry in the db', () => {
    let mockError
    beforeEach(() => {
      mockError = new Error('tum ti tum ti tum')
      getSessionExpiryDateTimeMock.mockRejectedValueOnce(mockError)
      authHandlerMiddleware(req, res, nextMock)
    })
    it('should not redirect to the 2fa route', () => {
      expect(redirectMock).not.toHaveBeenCalled()
    })
    it('should call next with an error', () => {
      expect(nextMock).toHaveBeenCalledWith(mockError)
    })
  })
})
