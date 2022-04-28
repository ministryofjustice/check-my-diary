const contactUs = require('./contact-us')

describe('contact-us middleware', () => {
  const renderMock = jest.fn()
  const username = 'sausages'
  const employeeName = 'Bacon Eggs'
  const csrfToken = 'tomato'
  const authUrl = 'cooked-breakfast.nom'
  beforeEach(() => {
    const res = { render: renderMock, locals: { csrfToken } }
    const req = { user: { username, employeeName }, authUrl }
    contactUs(req, res)
  })
  it('should call the render function once', () => {
    expect(renderMock).toHaveBeenCalledTimes(1)
    expect(renderMock.mock.calls[0][0]).toBe('pages/contact-us')
  })
  it('should call the render function with the correct parameters', () => {
    expect(renderMock.mock.calls[0][0]).toBe('pages/contact-us')
    expect(renderMock.mock.calls[0][1]).toEqual({ employeeName, csrfToken, authUrl })
  })
})
