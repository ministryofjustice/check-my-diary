const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');

const formatOut = bunyanFormat({ outputMode: 'short' });

const log = bunyan.createLogger({ name: 'Starter app', streams : [
    {
        path: './logs/check-my-diary.log'
    },{
        stream: process.stdout
    }
] });

module.exports = log;
