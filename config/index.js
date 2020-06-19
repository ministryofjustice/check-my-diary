const testConfig = require('./testConfig')
const prodConfig = require('./prodConfig')
const devConfig = require('./devConfig')

require('dotenv').config()

const getConfig = (env) => {
  if (env === 'test') return testConfig()
  if (env === 'production') return prodConfig()
  if (env === 'development') return devConfig()

  throw new Error('Set NODE_ENV to either production | development | test')
}

module.exports = getConfig(process.env.NODE_ENV)
