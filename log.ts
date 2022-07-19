import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'json', color: true })

const log = bunyan.createLogger({ name: 'Check My Diary', stream: formatOut, level: 'debug' })

export default log
