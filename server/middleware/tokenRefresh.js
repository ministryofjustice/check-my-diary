const logger = require('../../log.js')

module.exports = (signInService) => async (req, res, next) => {
  if (req.user && req.originalUrl !== '/logout') {
    const timeToRefresh = new Date() > req.user.refreshTime
    if (timeToRefresh) {
      try {
        const newToken = await signInService.getRefreshedToken(req.user)
        req.user.token = newToken.token
        req.user.refreshToken = newToken.refreshToken
        logger.info(`existing refreshTime in the past by ${new Date() - req.user.refreshTime}`)
        logger.info(
          `updating time by ${newToken.refreshTime - req.user.refreshTime} from ${req.user.refreshTime} to ${
            newToken.refreshTime
          }`,
        )
        req.user.refreshTime = newToken.refreshTime
      } catch (error) {
        logger.error(`Token refresh error: ${req.user.username}`, error.stack)
        return res.redirect('/logout')
      }
    }
  }
  return next()
}
