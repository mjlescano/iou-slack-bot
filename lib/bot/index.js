var log = require('debug')('iou-slack-bot:bot')
var config = require('../../config')
var balance = require('../balance')

module.exports = function (req, res, next) {
  // verify token
  if (config.token && config.token !== req.body.token) {
    return res.status(403).end()
  }

  if (!req.body) return res.status(400).end()

  res.status(200)

  if ('iou' === req.body.text) {
    res.json({
      text: debts(req.body.user_id)
    })
  } else if () {

  }

  res.end()
}


function debts(debitor) {
  var debts = balance.debt(debitor)

  if (!debts) return 'You have no debts.'

  var text = []

  Object.keys(debts).forEach(function(creditor){
    text.push(`${creditor}: $${debts[creditor]}`)
  })

  return `You owe to: ${text.join(' | ')}`
}
