const router = require('express').Router()
const { getStartMonth } = require('../helpers/utilities')
const logger = require('../../log')
const calendarMiddleware = require('../middleware/calendarMiddleware')

router.get('/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', calendarMiddleware)

// eslint-disable-next-line func-names
router.get('/', (req, res) => {
  logger.info('Catch and redirect to current month view')
  res.redirect(`/calendar/${getStartMonth()}`)
})

module.exports = router
