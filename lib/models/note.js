var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp')
var softDelete = require('mongoose-softdelete')

var Schema = mongoose.Schema

var NoteSchema = new Schema({
  amount: {type: Number, required: true, min: 1},
  debitor: {type: String, required: true, index: true},
  creditor: {type: String, required: true, index: true}
})

Toy.schema.path('amount').validate(function (value) {
  return Number.isSafeInteger(value);
}, '`amount` must be a positive number.');

NoteSchema.plugin(timestamps)
NoteSchema.plugin(softDelete)

NoteSchema.index({ debitor: 1, creditor: 1 })
