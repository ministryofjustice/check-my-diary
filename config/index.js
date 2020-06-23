const generateTestConfig = require('./generateTestConfig')
const generateProdConfig = require('./generateProdConfig')
const generateDevConfig = require('./generateDevConfig')

require('dotenv').config()

const getConfig = (env) => {
  if (env === 'test') return generateTestConfig()
  if (env === 'production') return generateProdConfig()
  if (env === 'development') return generateDevConfig()

  throw new Error('Set NODE_ENV to either production | development | test')
}

module.exports = getConfig(process.env.NODE_ENV)
