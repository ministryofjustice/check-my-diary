import { Pool, QueryConfig, QueryResult, QueryResultRow } from 'pg'
import fs from 'fs'

import logger from '../../../log'
import config from '../../../config'

export const pool = new Pool({
  user: config.db.username,
  host: config.db.server,
  database: config.db.database,
  password: config.db.password,
  port: 5432,
  ssl:
    config.db.sslEnabled === 'true'
      ? {
          ca: fs.readFileSync('root.cert'),
          rejectUnauthorized: true,
        }
      : false,
})

pool.on('error', (error: Error) => {
  logger.error('Unexpected error on idle client', error)
})

export type QueryPerformer = <R extends QueryResultRow = never, I extends never[] = never[]>(
  queryTextOrConfig: string | QueryConfig<I>,
  values?: I,
) => Promise<QueryResult<R>>

export const query: QueryPerformer = (queryTextOrConfig, values?) => pool.query(queryTextOrConfig, values)
