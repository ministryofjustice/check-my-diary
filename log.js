const bunyan = require('bunyan')
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

module.exports = log
