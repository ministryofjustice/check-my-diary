const { envListOr, envOr, envListOrThrow, envOrThrow } = require('./utils')

describe('config util functions', () => {
  describe(':: envOr', () => {
    test('returns given default if env is not set', () => {
      const actual = envOr('CAT', 'mooo')
      expect(actual).toBe('mooo')
    })
  })

  describe(':: envOrThrow', () => {
    test('returns given default if any of envs is not present', () => {
      try {
        envOrThrow('ANSWERS')
      } catch (error) {
        expect(error.message).toBe('Missing env var ANSWERS')
      }
    })
  })

  describe(':: envListOr', () => {
    test('returns given default if any of envs is not present', () => {
      const actual = envListOr(['CAT', 'BATMAN', 'THING'], 'sunshine')
      expect(actual).toBe('sunshine')
    })
  })

  describe(':: envListOrThrow', () => {
    test('returns given default if any of envs is not present', () => {
      try {
        envListOrThrow(['CAT', 'BATMAN', 'THING'])
      } catch (error) {
        expect(error.message).toBe('Missing one of the following env var CAT,BATMAN,THING')
      }
    })
  })
})
