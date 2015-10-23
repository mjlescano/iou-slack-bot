var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp')
var softDelete = require('mongoose-softdelete')

var Schema = mongoose.Schema

var NoteSchema = new Schema({
  amount: {type: Number, min: 0},
  debitor: {type: String, index: true},
  creditor: {type: String, index: true}
})

NoteSchema.plugin(timestamps)
NoteSchema.plugin(softDelete)

NoteSchema.index({ debitor: 1, creditor: 1 })
