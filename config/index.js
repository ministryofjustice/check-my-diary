const generateTestConfig = require('./generateTestConfig')
const generateProdConfig = require('./generateProdConfig')
const generateDevConfig = require('./generateDevConfig')

require('dotenv').config()

const getConfig = (env) => {
  switch (env) {
    case 'test':
      return generateTestConfig()
    case 'production':
      return generateProdConfig()
    case 'development':
      return generateDevConfig()
    default:
      throw new Error('Set NODE_ENV to either production | development | test')
  }
}

module.exports = getConfig(process.env.NODE_ENV)
