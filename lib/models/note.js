var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp')
var softDelete = require('mongoose-softdelete')

var Schema = mongoose.Schema

var NoteSchema = module.exports = new Schema({
  amount: {type: Number, required: true, min: 1},
  debitor: {type: String, required: true},
  creditor: {type: String, required: true}
})

NoteSchema.path('amount').validate(function (value) {
  return Number.isSafeInteger(value);
}, '`amount` must be a real number.');

NoteSchema.plugin(timestamps)
NoteSchema.plugin(softDelete)
