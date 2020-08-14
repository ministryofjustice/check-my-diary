const moment = require('moment')

const notificationMiddleware = require('./notificationMiddleware')
const { NONE, SMS } = require('../helpers/constants')

describe('notification middleware', () => {
  const renderMock = jest.fn()
  const nextMock = jest.fn()
  const token = 'aubergine'
  const csrfToken = 'courgette'
  const authUrl = 'carrot'
  const employeeName = 'fennel'
  const hmppsAuthMFAUser = 'peas'
  const notification1 = { shiftModified: '2020-08-24' }
  const notification2 = { shiftModified: '2020-08-26' }
  let noticationData

  const getPreferencesMock = jest.fn()
  const getNotificationsMock = jest.fn()
  const app = {
    get: () => ({
      notificationService: { getPreferences: getPreferencesMock, getNotifications: getNotificationsMock },
    }),
  }
  let req
  let res
  const errors = null
  beforeEach(() => {
    noticationData = [notification1, notification2]
    getNotificationsMock.mockResolvedValue(noticationData)
    res = { render: renderMock, locals: { csrfToken } }
    req = { user: { token, employeeName }, authUrl, hmppsAuthMFAUser, body: {}, app }
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('with notifications enabled', () => {
    describe('with no snooze', () => {
      beforeEach(async () => {
        getPreferencesMock.mockResolvedValue({ snoozeUntil: '', preference: SMS })
        await notificationMiddleware(req, res, nextMock)
      })
      it('should get the users notification preferences', () => {
        expect(getPreferencesMock).toHaveBeenCalledTimes(1)
        expect(getPreferencesMock).toHaveBeenCalledWith(token)
      })
      it('should get the users notifications', () => {
        expect(getNotificationsMock).toHaveBeenCalledTimes(1)
        expect(getNotificationsMock).toHaveBeenCalledWith(token)
      })
      it('should sort the users notifications', () => {
        expect(noticationData).toEqual([notification2, notification1])
      })
      it('should render the page with the correct values', () => {
        expect(renderMock).toHaveBeenCalledTimes(1)
        expect(renderMock).toHaveBeenCalledWith('pages/notifications', {
          errors,
          data: noticationData,
          csrfToken,
          hmppsAuthMFAUser,
          notificationsEnabled: true,
          snoozeUntil: '',
          moment,
          employeeName,
          authUrl,
        })
      })
      it('should not call the next function', () => {
        expect(nextMock).not.toHaveBeenCalled()
      })
    })
    describe('with a snooze', () => {
      beforeEach(async () => {
        getPreferencesMock.mockResolvedValue({ snoozeUntil: '2020-08-27', preference: SMS })
        await notificationMiddleware(req, res, nextMock)
      })
      it('should render the page with the correct values', () => {
        expect(renderMock).toHaveBeenCalledTimes(1)
        expect(renderMock).toHaveBeenCalledWith('pages/notifications', {
          errors,
          data: noticationData,
          csrfToken,
          hmppsAuthMFAUser,
          notificationsEnabled: true,
          snoozeUntil: 'Friday, 28th August 2020',
          moment,
          employeeName,
          authUrl,
        })
      })
    })
  })
  describe('with notifications disabled', () => {
    beforeEach(async () => {
      getPreferencesMock.mockResolvedValue({ preference: NONE })
      await notificationMiddleware(req, res, nextMock)
    })
    it('should get the users notification preferences', () => {
      expect(getPreferencesMock).toHaveBeenCalledTimes(1)
      expect(getPreferencesMock).toHaveBeenCalledWith(token)
    })
    it('should render the page reflecting a "none" notifications type', () => {
      expect(renderMock).toHaveBeenCalledTimes(1)
      expect(renderMock).toHaveBeenCalledWith('pages/notifications', {
        errors,
        data: noticationData,
        csrfToken,
        hmppsAuthMFAUser,
        notificationsEnabled: false,
        snoozeUntil: '',
        moment,
        employeeName,
        authUrl,
      })
    })
    it('should not call the next function', () => {
      expect(nextMock).not.toHaveBeenCalled()
    })
  })
})
