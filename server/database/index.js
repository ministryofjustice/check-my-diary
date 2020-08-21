const config = require('../../config.js')

// eslint-disable-next-line import/order
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: config.db.server,
    database: config.db.database,
    user: config.db.username,
    password: config.db.password,
    ssl: config.db.sslEnabled === 'true',
  },
  pool: { min: 0, max: 7 },
})

module.exports = knex
