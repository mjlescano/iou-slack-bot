var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp')
var softDelete = require('mongoose-softdelete')

var Schema = mongoose.Schema

var NoteSchema = module.exports = new Schema({
  amount: {type: Number, required: true, min: 1},
  debitor: {type: String, required: true, index: true},
  creditor: {type: String, required: true, index: true},
  subject: {type: String, maxlength: 1024, trim: true}
})

NoteSchema.path('amount').validate(function (value) {
//  return Number.isSafeInteger(value)
  return Number.isFinite(value);
}, '`amount` must be a real number.')

NoteSchema.pre('save', function (next) {
  if (this.debitor === this.creditor) {
    return next(new Error('`debitor` can\'t be the same as `creditor`.'))
  }
  next()
})

// Getter
NoteSchema.path('amount').get(function(num) {
  return Number((num / 100).toFixed(2));
});

// Setter
NoteSchema.path('amount').set(function(num) {
  return num * 100;
});

NoteSchema.plugin(timestamps)
NoteSchema.plugin(softDelete)
