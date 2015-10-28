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
  return debits[debitor][creditor] || 0
}

module.exports.credit = function credit(creditor, debitor) {
  if (!credits[creditor]) return 0
  return credits[creditor][debitor] || 0
}

module.exports.debts = function debts(debitor) {
  return deepcopy(debits[debitor])
}

module.exports.credits = function credits(creditor) {
  return deepcopy(credits[creditor])
}

module.exports.between = function between(debitor, creditor) {
  return debt(debitor, creditor) - credit(debitor, creditor)
}

module.exports.get = function get(debitor) {
  var creditors = Object.keys(debits[debitor] || {})
  var debitors = Object.keys(credits[debitor] || {})
  var users = union(debitors, creditors)
  var balance = {}
  users.forEach(user => {
    var amount = between(debitor, user)
    if (amount === 0) return
    balance[user] = amount
  })
  return balance
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
      accept(note)
    })
  })
}

function union(a, b) {
  return a.concat(b.filter(item => a.indexOf(item) < 0))
}
