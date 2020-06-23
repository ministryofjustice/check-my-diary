const devConfig = require('./devConfig')

describe('devConfig', () => {
  let config

  beforeAll(() => {
    config = devConfig()
  })

  test('production value is false', () => {
    expect(config.app.production).toBe(false)
  })

  test('port defaults to 3000', () => {
    expect(config.port).toBe(3000)
  })

  test('auth url is set to default', () => {
    expect(config.nomis.authUrl).toBe('http://localhost:9191/auth')
  })
})
