const generateTestConfig = require('./generateTestConfig')

describe('generateTestConfig', () => {
  let config

  beforeAll(() => {
    config = generateTestConfig()
  })

  test('production value is false', () => {
    expect(config.app.production).toBe(false)
  })

  test('port defaults to 3005', () => {
    expect(config.port).toBe(3005)
  })

  test('auth url is set to default', () => {
    expect(config.nomis.authUrl).toBe('http://localhost:9191/auth')
  })
})
