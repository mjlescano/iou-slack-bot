var mongoose = require('mongoose')
var config = require('../../config')

mongoose.connect(config.mongoUrl)

module.exports = {
  Note: mongoose.model('Note', require('./note'))
}
