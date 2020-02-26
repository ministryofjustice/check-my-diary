/* const bunyan = require('bunyan')
const config = require('./config')

const log = bunyan.createLogger({
  name: 'Check My Diary',
  streams: [
    {
      path: config.log.fileLocation,
      level: config.log.level,
      type: 'rotating-file',
      period: config.log.period,
      count: Number(config.log.numberOfLogFilesToKeep),
    },
    {
      stream: process.stdout,
      level: config.log.level,
    },
  ],
})

module.exports = log */

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')

const formatOut = bunyanFormat({ outputMode: 'json', color: true })

const log = bunyan.createLogger({ name: 'Check My Diary', stream: formatOut, level: 'debug' })

module.exports = log
