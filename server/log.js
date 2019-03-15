const Logger = require('bunyan');

module.exports = new Logger({
  name: 'check-my-diary',
  streams: [
    {         
        path: './logs/check-my-diary-internal.log',
        level: 'debug'        
    }
  ]
});
