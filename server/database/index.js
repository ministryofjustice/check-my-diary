const config = require('../../config.js')

const knex = require('knex')({
    client: 'pg',
    connection : {
        host: config.db.server,
        database: config.db.database,
        user: config.db.username,
        password: config.db.password
    },
    pool: { min: 0, max: 7 }
})

module.exports = knex