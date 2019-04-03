const Logger = require('bunyan');

module.exports = new Logger({
  name: 'check-my-diary',
  streams: [
    {     
      stream : process.stdout,
      level : 'debug'
    },
    {         
        path: './logs/check-my-diary-internal.log',
        level: 'debug'        
    }
  ]
});
