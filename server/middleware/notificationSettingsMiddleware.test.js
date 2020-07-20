const notificationSettingsMiddleware = require('./notificationSettingsMiddleware')
const { NONE, SMS } = require('../helpers/constants')

describe('notification settings middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'
  const username = 'kale'
  const hmppsAuthMFAUser = 'peas'
  const mobileNumber = '404040404'

  const getPreferencesMock = jest.fn()
  const app = { get: () => ({ notificationService: { getPreferences: getPreferencesMock } }) }
  let req
  let res
  beforeEach(() => {
    res = { render: renderMock, locals: { csrfToken } }
    req = { user: { token, username, employeeName }, authUrl, hmppsAuthMFAUser, body: {}, app }
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with persisted preferences', () => {
    beforeEach(() => {
      getPreferencesMock.mockResolvedValue({ preference: SMS, email: '', sms: '404040404' })
      notificationSettingsMiddleware(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page with the correct values', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings', {
        authUrl,
        csrfToken,
        employeeName,
        hmppsAuthMFAUser,
        uid: username,
        contactMethod: SMS,
        inputEmail: '',
        inputMobile: mobileNumber,
        errors: null,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
  describe('with no persisted preferences', () => {
    beforeEach(() => {
      getPreferencesMock.mockResolvedValue({})
      notificationSettingsMiddleware(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page reflecting a "none" notifications type', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notification-settings', {
        authUrl,
        csrfToken,
        employeeName,
        hmppsAuthMFAUser,
        uid: username,
        contactMethod: NONE,
        inputEmail: '',
        inputMobile: '',
        errors: null,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
})
