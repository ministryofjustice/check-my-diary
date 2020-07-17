const { validationResult } = require('express-validator')

const validate = (req, res, next) => {
  const errors = validationResult(req)
    .array({ onlyFirstError: true })
    .map(({ msg }) => msg)
  if (errors && errors.length > 0) res.locals.errors = errors
  return next()
}

module.exports = validate
