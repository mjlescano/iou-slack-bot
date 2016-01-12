var mongoose = require('mongoose')
var connReady = require('mongoose-connection-ready')
var config = require('../../config')

mongoose.connect(config.mongoUrl)

module.exports = {
  Note: mongoose.model('Note', require('./note')),
  ready: function () { return connReady(mongoose.connection) }
}
