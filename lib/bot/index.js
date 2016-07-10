var express = require('express')
var bodyParser = require('body-parser')
var moment = require('moment')
var log = require('debug')('iou-slack-bot:bot')
var config = require('../../config')
var Note = require('../models').Note
var balance = require('../balance')

var app = module.exports = express()

app.use(bodyParser.urlencoded({extended: true}))

/**
 * Check if app is loaded
 */

app.all('*', function (req, res, next) {
  if (app.enabled('app')) return next()
  res.status(200).json({
    text: 'Sorry, but the app is loading, try again later.'
  }).end()
})

/**
 * Verify Token
 */

app.use(function verifyToken (req, res, next) {
  if (!config.token || config.token === req.body.token) return next()
  res.status(403).end()
})

app.post('/', function (req, res, next) {
  if (!/^iou\s+help$/i.test(req.body.text)) return next()

  var text = [
    '```',
    'iou              # Get all my debts',
    'iou @user        # Get all my debts to @user',
    'iou @user $20    # Add $20 to my debt to @user',
    '```'
  ]

  res.status(200).json({
    text: text.join('\n')
  }).end()
})

app.post('/', function (req, res, next) {
  if (!/^iou$/i.test(req.body.text)) return next()

  res.status(200).json({
    text: getBalance(req.body.user_id)
  }).end()
})

app.post('/', function (req, res, next) {
  if (!/^iou\s+history$/i.test(req.body.text)) return next()

  var debitor = req.body.user_id
  log(`History requested by <@${debitor}>.`)

  getHistory(debitor)
    .then((notes) => {
      var text
      if (notes.length) {
        text = [
          `<@${debitor}>, here you go:`,
          '```',
          notes.map((n) => toHistoryItem(debitor, n)).join('\n'),
          '```'
        ].join('\n')
      } else {
        text = `<@${debitor}>, we couldn't find any note issued by you, or to you.`
      }
      res.status(200).json({
        text: text
      }).end()
    })
    .catch((err) => {
      log(err)
      res.status(500).json({
        text: `<@${debitor}>, sorry, but there was an error with your request.`
      }).end()
    })
})

app.post('/', function (req, res, next) {
  var match = req.body.text.match(/^iou\s+<@([0-9A-Z]+)>$/i)

  if (!match) return next()

  res.status(200).json({
    text: getBalanceBetween(req.body.user_id, match[1])
  }).end()
})

app.post('/', function (req, res, next) {
  var match = req.body.text.match(/^iou\s+<@([0-9A-Z]+)>\s+[\$€]?([0-9]+)(?:\s+(.+))?$/i)

  if (!match) return next()

  var debitor = req.body.user_id
  var creditor = match[1]
  var amount = match[2]
  var subject = match[3]

  balance.issue(debitor, creditor, amount, subject)
    .then((note) => {
      var text = `Note issued from <@${note.debitor}> to <@${note.creditor}> for an amount of ${note.amount}.`
      log(text)
      res.status(200).json({ text: text }).end()
    })
    .catch((err) => {
      log(err)
      res.status(500).json({
        text: `<@${debitor}>, sorry, but there was an error with your request.`
      }).end()
    })
})

function getBalance (debitor) {
  var balances = balance.get(debitor)
  var users = Object.keys(balances)

  if (!users.length) return `<@${debitor}>, you have no debts nor credits.`

  var text = []

  users.forEach(function (user) {
    text.push(`<@${user}>: ${balances[user]}`)
  })

  return [
    `<@${debitor}>, here you go:`,
    '```',
    text.join('\n'),
    '```'
  ].join('\n')
}

function getBalanceBetween (debitor, creditor) {
  var amount = balance.between(debitor, creditor)

  if (amount === 0) {
    return `<@${debitor}>, you have no debts with <@${creditor}>.`
  } else if (amount > 0) {
    return `<@${debitor}>, you owe ${amount} to <@${creditor}>.`
  } else {
    return `<@${debitor}>, <@${creditor}> owes you '${Math.abs(amount)}'.`
  }
}

function getHistory (debitor) {
  return Note.find()
    .or([{debitor: debitor}, {creditor: debitor}])
    .sort({createdAt: 'desc'})
    .exec()
}

function toHistoryItem (debitor, note) {
  var text = `${moment(note.createdAt).format('YYYY-MM-DD')}:`

  if (debitor === note.debitor) {
    text += ` <@${note.creditor}> gave you ${note.amount}.`
  } else {
    text += ` you gave <@${note.debitor}> ${note.amount}.`
  }

  if (note.subject) {
    text += ` Subject: ${note.subject}.`
  }

  return text
}
