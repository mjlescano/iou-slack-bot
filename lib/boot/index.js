var express = require('express')
var bodyParser = require('body-parser')

var app = module.exports = express()

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))

// Status
app.get('/', function (req, res) { res.status(200).send('¡Todo bien!') })

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(400).send(err.message)
})
