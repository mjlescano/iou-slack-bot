module.exports = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGOLAB_URI || 'mongodb://localhost/iou-slack-bot',
  slackToken: process.env.SLACK_TOKEN || throw new Error('SLACK_TOKEN must be defined.')
}
