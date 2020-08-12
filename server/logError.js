const log = require('../log')

const logError = (url, { response, stack, message }, msg) => {
  if (response) {
    const { status, statusText, headers, config, data } = response
    log.error({ url, status, statusText, headers, config, stack, data, message }, msg)
  } else {
    log.error({ url, stack, message }, msg)
  }
  return new Error(msg)
}

module.exports = logError
