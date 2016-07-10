module.exports = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGOLAB_URI || process.env.MONGO_URL || 'mongodb://localhost/iou-slack-bot',
  token: process.env.TOKEN || null
}
