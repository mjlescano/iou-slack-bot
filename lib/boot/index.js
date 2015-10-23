const express = require('express')
const bodyParser = require('body-parser')
const debug = require('debug')

const log = debug('iou-slack-bot:boot')
const app = module.exports = express()

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
