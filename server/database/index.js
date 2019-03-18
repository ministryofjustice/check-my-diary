const knex = require('knex')({
    client: 'pg',
    connection : {
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD
    },
    pool: { min: 0, max: 7 }
});

module.exports = knex;