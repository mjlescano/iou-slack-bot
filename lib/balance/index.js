var Note = require('../models').Note

var debits = {}
var credits = {}

module.exports = {
  load: load,
  debt: debt,
  credit: credit,
  between: between,
  get: get,
  issue: issue
}

function load () {
  return new Promise((accept, reject) => {
    Note.find().stream()
      .on('data', function (note) {
        _issue(note.debitor, note.creditor, note.amount)
      })
      .on('error', reject)
      .on('close', accept)
  })
}

function debt (debitor, creditor) {
  if (!debits[debitor]) return 0
  return debits[debitor][creditor] || 0
}

function credit (creditor, debitor) {
  if (!credits[creditor]) return 0
  return credits[creditor][debitor] || 0
}

function between (debitor, creditor) {
  return debt(debitor, creditor) - credit(debitor, creditor)
}

function get (debitor) {
  var creditors = Object.keys(debits[debitor] || {})
  var debitors = Object.keys(credits[debitor] || {})
  var users = _union(debitors, creditors)
  var balance = {}

  users.forEach(user => {
    var amount = between(debitor, user)
    if (amount === 0) return
    balance[user] = amount
  })

  return balance
}

function issue (debitor, creditor, amount, subject) {
  return new Promise((accept, reject) => {
    Note.create({
      amount: amount,
      debitor: debitor,
      creditor: creditor,
      subject: subject
    }, function (err, note) {
      if (err) return reject(err)
      _issue(note.debitor, note.creditor, note.amount)
      accept(note)
    })
  })
}

function _issue (debitor, creditor, amount) {
  if (!debits[debitor]) debits[debitor] = {}
  if (!credits[creditor]) credits[creditor] = {}

  var debit = debits[debitor]
  var credit = credits[creditor]

  if (!debit[creditor]) debit[creditor] = 0
  if (!credit[debitor]) credit[debitor] = 0

  debit[creditor] += amount
  credit[debitor] += amount
}

function _union (a, b) {
  return a.concat(b.filter(item => a.indexOf(item) < 0))
}
