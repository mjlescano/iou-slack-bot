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
        text = `<@${debitor}>, we couldn't find any note issued in your name.`
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

app.post('/', function (req, res, next) {
  var match = req.body.text.match(/^ask\s+<@([0-9A-Z]+)>\s+[\$€]?([0-9]+)(?:\s+(.+))?$/i)

  if (!match) return next()

  var debitor = match[1]
  var creditor = req.body.user_id
  var amount = match[2]
  var subject = match[3]

  balance.issue(debitor, creditor, amount, subject)
    .then((note) => {
      var text = [
        `Note issued from <@${note.debitor}> to <@${note.creditor}> for an amount of ${note.amount}.`,
        `<@${note.debitor}>, if you want to cancel this debt, just type \`ask <@${note.debitor}> ${note.amount}\`.`
      ]

      log(text[0])

      res.status(200).json({
        text: text.join('\n')
      }).end()
    })
    .catch((err) => {
      log(err)
      res.status(500).json({
        text: `<@${creditor}>, sorry, but there was an error with your request.`
      }).end()
    })
})

app.post('/', function (req, res, next) {
  var text = []

  if (!/^iou\s+help$/i.test(req.body.text)) {
    text.push('I couldn\'t understand that :thinking_face:. Here\'s my entire language:')
  }

  text.push(
    '```',
    'iou              # Shows all your debts',
    'iou @user        # Get a list of your accounts with @user',
    'iou @user $20    # Add $20 to your debt to @user (the "$" is optional)',
    'ask @user $20    # Make @user owe you $20',
    'iou help         # This',
    'iou history      # Shows a list of all the transactions you where involved',
    '```'
  )

  res.status(200).json({
    text: text.join('\n')
  }).end()
})

function getBalance (debitor) {
  var balances = balance.get(debitor)
  var users = Object.keys(balances)

  if (!users.length) return `<@${debitor}>, you have no debts nor credits.`

  var text = []

  var debits = users.filter((user) => balances[user] > 0)
  var credits = users.filter((user) => balances[user] < 0)

  text.push('```')
  if (debits.length) {
    text.push('You owe:')
    debits.forEach((user) => {
      text.push(`  <@${user}>: ${balances[user]}`)
    })
  } else {
    text.push('You don\'t owe nothing.')
  }
  text.push('```')

  text.push('```')
  if (credits.length) {
    text.push('Owes you:')
    credits.forEach((user) => {
      text.push(`  <@${user}>: ${Math.abs(balances[user])}`)
    })
  } else {
    text.push('Nobody owes you.')
  }
  text.push('```')

  return [
    `<@${debitor}>, here you go:\n`,
    text.join('\n')
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
