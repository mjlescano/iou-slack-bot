var app = require('./lib/boot')
var config = require('./config')

app.listen(config.port, function () {
  console.log(' · ' + config.port + ' · ')
})
