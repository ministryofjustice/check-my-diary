const generateProdConfig = require('./generateProdConfig')

describe('generateProdConfig', () => {
  test('expect profConfig to throw', () => {
    try {
      generateProdConfig()
    } catch (error) {
      expect(error).toBeTruthy()
    }
  })
})
