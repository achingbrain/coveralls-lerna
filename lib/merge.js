'use strict'

function merge (reports) {
  return reports.reduce((a, b) => a.concat(b))
}

module.exports = merge
