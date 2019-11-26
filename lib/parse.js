'use strict'

const path = require('path')
const parseLcov = require('./parse/parse-lcov')
const parseJacoco = require('./parse/parse-jacoco')

const reports = {
  lcov: parseLcov,
  jacoco: parseJacoco
}

function parse ({ reportFile, type, workingDirectory = '.' }, config) {
  if (!reportFile) {
    throw new Error('Missing required parameter `reportFile`')
  }

  if (!type) {
    throw new Error('Missing required parameter `type`')
  }

  if (reports[type]) {
    config.workingDirectory = path.resolve(config.projectRoot, workingDirectory)

    return reports[type](reportFile, config)
  }

  throw new Error(`Unsupported report type "${type}". Supported types are ${Object.keys(reports).join(', ')}`)
};

module.exports = parse
