var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp')

var Schema = mongoose.Schema

var NoteSchema = new Schema({
  amount: {type: Number},
  debitor: {type: String, index: true},
  creditor: {type: String, index: true}
})

NoteSchema.plugin(timestamps)

NoteSchema.index({ debitor: 1, creditor: 1 })
