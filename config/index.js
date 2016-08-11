var env = process.env

module.exports = {
  port: env.PORT || 3000,
  mongoUrl: env.MONGOLAB_URI || env.MONGO_URL || 'mongodb://localhost/iou-slack-bot',
  tokens: (env.TOKEN || env.TOKENS) && (env.TOKEN || env.TOKENS).split(',') || []
}
