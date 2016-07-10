var express = require('express')
var debug = require('debug')
var models = require('../models')
var balance = require('../balance')

var log = debug('iou-slack-bot:boot')
var app = module.exports = express()

app.disable('app')

app.use('/bot', require('../bot'))

app.get('/', function (req, res) { res.status(200).send('¡Hola!') })

// error handler
app.use(function (err, req, res, next) {
  log(err.stack)
  res.status(400).send(err.message)
})

app.start = function start (port) {
  return new Promise(function (resolve, reject) {
    models.ready().then(balance.load()).then(function () {
      app.listen(port, function (err) {
        if (err) return reject(err)
        app.enable('app')
        resolve()
      })
    }).catch(reject)
  })
}
