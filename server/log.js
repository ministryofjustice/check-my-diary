const Logger = require('bunyan');

module.exports = new Logger({
  name: 'keyworkerUI',
  streams: [
    {         
        path: './check-my-diary-internal.log',
        level: 'debug'        
    }
  ]
});
