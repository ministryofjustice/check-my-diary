const app = require('./server/index')
const log = require('./log')

app.listen(app.get('port'), () => {
  log.info(`Server listening on port ${app.get('port')}`)
})

/* log.debug('Migration start')
const knex1 = knex(init)
knex1.migrate.latest().then(() => {
  log.debug('Migration finished')
  app.listen(app.get('port'), () => {
    log.info(`Server listening on port ${app.get('port')}`)
  })
}) */
