'use strict'

const fs = require('fs')
const crypto = require('crypto')

function getRelativeFilePath (absoluteFilePath, workingDirectory) {
  return absoluteFilePath.slice(workingDirectory.length + 1)
}

function getNumberOfLinesInSource (source) {
  return source.split('\n').length
}

function getSourceFromFile (filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' })
}

function getSourceDigest (source) {
  return crypto.createHash('md5').update(source).digest('hex')
}

function padWithNull (coverallsSourceFile, number) {
  for (let i = 0; i < number; i++) {
    coverallsSourceFile.coverage.push(null)
  }
}

function doesFilexExistOn(path) {
  let exists = true;

  try {
    getSourceFromFile(path);
  } catch (error) {
    exists = false;
  }
  return exists;
}

function getServiceName () {
  if (process.env.TRAVIS) {
    return 'travis-ci'
  }

  if (process.env.JENKINS_URL) {
    return 'Jenkins'
  }

  if (process.env.CIRCLECI) {
    return 'Circle CI'
  }

  if (process.env.bamboo_planKey) {
    return 'Bamboo'
  }

  if (process.env.TF_BUILD) {
    return 'Team Foundation'
  }

  if (process.env.TEAMCITY_VERSION) {
    return 'TeamCity'
  }

  return process.env.COVERALLS_SERVICE_NAME
}

function getServiceJobId () {
  if (process.env.TRAVIS_JOB_ID) {
    return process.env.TRAVIS_JOB_ID
  }
}

module.exports = {
  getRelativeFilePath,
  getNumberOfLinesInSource,
  getSourceFromFile,
  getSourceDigest,
  padWithNull,
  getServiceName,
  getServiceJobId,
  doesFilexExistOn
}
