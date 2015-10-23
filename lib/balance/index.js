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
  if (!debits[debitor]) return 0
  if (!creditor) {
    return deepcopy(debits[debitor])
  } else {
    if (!debits[debitor][creditor]) return 0
    return deepcopy(debits[debitor][creditor])
  }
}

module.exports.credit = function credit(creditor, debitor) {
  if (!credits[creditor]) return 0
  if (!debitor) {
    return deepcopy(credits[creditor])
  } else {
    if (!credits[creditor][debitor]) return 0
    return deepcopy(credits[creditor][debitor])
  }
}

module.exports.issue = function issue(debitor, creditor, amount) {
  return new Promise((accept, reject) => {
    Note.create({
      amount: amount,
      debitor: debitor,
      creditor: creditor
    }, function (err, note) {
      if (err) return reject(err)
      _issue(note.debitor, note.creditor, note.amount)
      // log(`Note created from ${debitor} to ${creditor} for '${amount}.'`)
      accept(note)
    })
  })
}
