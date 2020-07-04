const fs = require('fs')
const db = require('../../server/database')

const deleteRows = (table) => db(table).del()

const clearNotificationTables = async () => {
  await deleteRows('SHIFT_NOTIFICATION')
  await deleteRows('SHIFT_TASK_NOTIFICATION')
}

const destroy = async (done) => {
  db.destroy(done)
}

const createTablesInsertData = async () => {
  await db.raw(fs.readFileSync('postgres-dump/00_tables.sql').toString())
  await db.raw(fs.readFileSync('postgres-dump/01_data_Prison.sql').toString())
  await db.raw(fs.readFileSync('postgres-dump/02_data_NotificationConfiguration.sql').toString())
  await db.raw(fs.readFileSync('postgres-dump/03_data_UserAuthentication.sql').toString())
  await db.raw(fs.readFileSync('postgres-dump/04_data_UserNotificationSetting.sql').toString())
  return null
}

module.exports = {
  clearDb: () => clearNotificationTables(),
  destroy,
  createTablesInsertData,
}
