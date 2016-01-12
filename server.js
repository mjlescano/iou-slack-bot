var app = require('./lib/boot')
var config = require('./config')

app.start(config.port).then(function () {
  console.log(' · ' + config.port + ' · ')
})
