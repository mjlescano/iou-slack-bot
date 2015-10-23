var log = require('debug')('iou-slack-bot:bot')
var config = require('../../config')

module.exports = function (req, res, next) {
  // verify token
  if (config.token && config.token !== req.body.token) {
    return res.status(403).end()
  }

  // avoid infinite loop
  if (req.body.user_name === 'slackbot') return res.status(200).end()

  console.log('===============================')
  console.log(req.body)
  console.log('===============================')

  var userName = req.body.user_name
  var botPayload = {
    text : 'Hello, ' + userName + '!'
  }


  return res.status(200).json(botPayload)
}
