const fs = require('fs')
const config = require('../../config.js')

// eslint-disable-next-line import/order
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: config.db.server,
    database: config.db.database,
    user: config.db.username,
    password: config.db.password,
    ssl:
      config.db.sslEnabled === 'true'
        ? {
          ca: fs.readFileSync('root.cert'),
          rejectUnauthorized: true,
        }
        : false,
  },
  pool: { min: 0, max: 7 },
})

module.exports = knex
