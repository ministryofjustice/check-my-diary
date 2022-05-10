const config = require('../../config')

function generateOauthClientToken() {
  return generate(config.apis.hmppsAuth.apiClientId, config.apis.hmppsAuth.apiClientSecret)
}

function generate(clientId, clientSecret) {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  return `Basic ${token}`
}

module.exports = {
  generateOauthClientToken,
  generate,
}
