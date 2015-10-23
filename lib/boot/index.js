var express = require('express')
var bodyParser = require('body-parser')
var debug = require('debug')

var log = debug('iou-slack-bot:boot')
var app = module.exports = express()

log('loading balance from database...')
require('../balance').load().then(() => log('done!'))

app.use(bodyParser.urlencoded({ extended: true }))

app.post('/bot', require('../bot'))
app.get('/', function (req, res) { res.status(200).send('¡Todo bien!') })

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.message)
})
