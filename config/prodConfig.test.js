const prodConfig = require('./prodConfig')

describe('prodConfig', () => {
  test('expect profConfig to throw', () => {
    try {
      prodConfig()
    } catch (error) {
      expect(error).toBeTruthy()
    }
  })
})
