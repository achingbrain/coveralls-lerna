#!/usr/bin/env node

'use strict'

const path = require('path')
const fs = require('fs-extra')
const coveralls = require('../')

async function main () {
  const files = await fs.readdir(path.join(process.cwd(), 'packages'))

  const reports = files
    .filter(dir => fs.existsSync(path.join('packages', dir, 'coverage', 'lcov.info')))
    .map(dir => {
      return {
        type: 'lcov',
        reportFile: path.join('packages', dir, 'coverage', 'lcov.info'),
        workingDirectory: path.join('packages', dir)
      }
    })

  const url = await coveralls.sendReports(reports)

  console.log('POST to Coveralls successful!')
  console.log('Job URL:', url)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
