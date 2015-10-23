var log = require('debug')('iou-slack-bot:bot')
var config = require('../../config')
var balance = require('../balance')

module.exports = function (req, res, next) {
  // verify token
  if (config.token && config.token !== req.body.token) {
    return res.status(403).end()
  }

  console.log(req.body)

  // avoid infinite loop
  if (req.body.user_name === 'slackbot') return res.status(200).end()

  var userName = req.body.user_name
  var botPayload = {
    text : 'Hello, ' + userName + '!'
  }

  res.status(200).json(botPayload)
}
