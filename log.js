const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');

const formatOut = bunyanFormat({ outputMode: 'short' });

const log = bunyan.createLogger({ name: 'Starter app', streams : [
    {
        path: './logs/check-my-diary.log',
        level: 'debug'
    },
    {
        stream : process.stdout,
        level : 'debug'
    }
] });

module.exports = log;
