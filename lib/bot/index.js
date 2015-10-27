var express = require('express')
var bodyParser = require('body-parser')
var log = require('debug')('iou-slack-bot:bot')
var config = require('../../config')
var balance = require('../balance')

var app = module.exports = express()

app.use(bodyParser.urlencoded({ extended: true }))

/**
 * Verify Token
 */

app.use(function verifyToken(req, res, next) {
  if (!config.token || config.token === req.body.token) return next()
  res.status(403).end()
})

app.post('/', function (req, res, next) {
  if ('iou help' !== req.body.text) return next()

  var text = [
    '```',
    'iou              # Get all my debts',
    'iou @user        # Get all my debts to @user',
    'iou @user $20    # Add $20 to my debt to @user',
    '```',
  ]

  res.status(200).json({
    text: text.join('\n')
  }).end()
})

app.post('/', function (req, res, next) {
  if ('iou' !== req.body.text) return next()

  res.status(200).json({
    text: debts(req.body.user_id)
  }).end()
})

app.post('/', function (req, res, next) {
  var match = req.body.text.match(/^iou\s+<@([0-9A-Z]+)>$/)

  if (!match) return next()

  res.status(200).json({
    text: debts(req.body.user_id, match[1])
  }).end()
})

app.post('/', function (req, res, next) {
  var match = req.body.text.match(/^iou\s+<@([0-9A-Z]+)>\s+[\$€]?([0-9]+)$/)

  if (!match) return next()

  var debitor = req.body.user_id
  var creditor = match[1]
  var amount = match[2]

  balance.issue(debitor, creditor, amount)
    .then(note => {
      var text = `Note generated from <@${note.debitor}> to <@${note.creditor}> for $${note.amount}.`
      log(text)
      res.status(200).json({ text: text }).end()
    })
    .catch(err => {
      log(err)
      res.status(500).end()
    })
})

function debts(debitor, creditor) {
  var debts = balance.debt(debitor, creditor)

  if (!debts) {
    if (creditor) {
      return `<@${debitor}> you have no debts with <@${creditor}>.`
    } else {
      return `<@${debitor}> you have no debts.`
    }
  }

  var text = []

  Object.keys(debts).forEach(function(creditor){
    text.push(`<@${creditor}>: $${debts[creditor]}`)
  })

  return `You owe:\n${text.join('\n')}`
}
