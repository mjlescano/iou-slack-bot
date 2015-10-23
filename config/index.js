module.exports = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGOLAB_URI || 'mongodb://localhost/iou-slack-bot',
}
