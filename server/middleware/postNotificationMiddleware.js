const moment = require('moment')
const logger = require('../../log')

const postNotificationMiddleware = async (req, res, next) => {
  try {
    const {
      user: { token },
      app,
      body: { pauseUnit, pauseValue },
    } = req
    const {
      locals: { errors = null },
    } = res
    if (!errors || errors.length === 0) {
      logger.info('Updating pause notifications')
      const {
        notificationService: { updateSnooze },
      } = app.get('DataServices')
      await updateSnooze(token, moment().add(pauseValue, pauseUnit).format('YYYY-MM-DD'))
    }

    return next()
  } catch (error) {
    const message = 'Pause notifications failed. Please try again.'
    logger.error(error, message)
    res.locals.error = [message]
    return next()
  }
}

module.exports = postNotificationMiddleware
