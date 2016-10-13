var mongoose = require('mongoose')
var connReady = require('mongoose-connection-ready')
var config = require('../../config')

mongoose.Promise = global.Promise

mongoose.connect(config.mongoUrl, {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
})

module.exports = {
  Note: mongoose.model('Note', require('./note')),
  ready: function () { return connReady(mongoose.connection) }
}
