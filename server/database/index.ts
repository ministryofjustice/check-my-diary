import knex, { Knex } from 'knex'
import fs from 'fs'
import config from '../config'

export default (): Knex => {
  return knex({
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
}
