var deepcopy = require('deepcopy')
var Note = require('../models').Note

var debits = {}
var credits = {}

function _issue(debitor, creditor, amount) {
  if (!debits[debitor]) debits[debitor] = {}
  if (!credits[creditor]) credits[creditor] = {}

  var debit = debits[debitor]
  var credit = credits[creditor]

  if (!debit[creditor]) debit[creditor] = 0
  if (!credit[debitor]) credit[debitor] = 0

  debit[creditor] += amount
  credit[debitor] += amount
}

module.exports.load = function load() {
  return new Promise((accept, reject) => {
    Note.find().stream()
      .on('data', function (note) {
        _issue(note.debitor, note.creditor, note.amount)
      })
      .on('error', reject)
      .on('close', accept)
  })
}

module.exports.debt = function debt(debitor, creditor) {
  if (!debits[debitor]) return null
  if (creditor) {
    if (!debits[debitor][creditor]) return null
    var d = {}
    d[creditor] = debits[debitor][creditor]
    return d
  } else {
    return deepcopy(debits[debitor])
  }
}

module.exports.credit = function credit(creditor, debitor) {
  if (!credits[creditor]) return null
  if (debitor) {
    if (!credits[creditor][debitor]) return null
    var c = {}
    d[debitor] = credits[creditor][debitor]
    return d
  } else {
    return deepcopy(credits[creditor])
  }
}

module.exports.issue = function issue(debitor, creditor, amount) {
  return new Promise((accept, reject) => {
    var note = new Note({
      amount: amount,
      debitor: debitor,
      creditor: creditor
    })

    note.save(function (err, note) {
      if (err) return reject(err)
      _issue(note.debitor, note.creditor, note.amount)
      accept(note)
    })
  })
}
