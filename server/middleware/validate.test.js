const { validationResult } = require('express-validator')
const validate = require('./validate')

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}))

describe('should carry out validation and set appropriate errors in "res.locals"', () => {
  const req = {}
  const res = { locals: {} }
  const next = jest.fn()

  const error1Msg = 'Cynics are simply thwarted romantics.'
  const error2Msg = 'No one of consequence.'
  const error3Msg = 'Inconceivable!'
  const error1 = { value: '', msg: error1Msg, param: 'wGoldman', location: 'body' }
  const error2 = { value: '', msg: error2Msg, param: 'dpRoberts', location: 'body' }
  const error3 = { value: '', msg: error3Msg, param: 'vizzini', location: 'body' }

  afterEach(() => {
    validationResult.mockReset()
    next.mockReset()
    res.locals = {}
  })

  describe('when errors are found', () => {
    beforeEach(() => {
      validationResult.mockImplementation(() => ({
        array: () => [error1, error2, error3],
      }))
      validate(req, res, next)
    })
    it('should validate the errors', () => {
      expect(validationResult).toHaveBeenCalledTimes(1)
    })
    it('should set res.locals.errors', () => {
      expect(res.locals.errors.length).toBeGreaterThan(0)
    })
    it('should format the errors into an array of strings', () => {
      expect(res.locals.errors).toEqual([error1Msg, error2Msg, error3Msg])
    })
    it('should call next', () => {
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('when errors are not found', () => {
    beforeEach(() => {
      validationResult.mockImplementation(() => ({
        array: () => [],
      }))
      validate(req, res, next)
    })
    it('should validate the errors', () => {
      expect(validationResult).toHaveBeenCalledTimes(1)
    })
    it('should not set "res.locals.errors"', () => {
      expect(res.locals.errors).not.toBeDefined()
    })
    it('should call next', () => {
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
