/* eslint-env mocha */
'use strict'

const {
  getRelativeFilePath,
  getNumberOfLinesInSource,
  getSourceFromFile,
  getSourceDigest,
  padWithNull,
  getServiceName
} = require('../../../lib/util/helpers')
const expect = require('../../util/chai')
const Chance = require('chance')
const sinon = require('sinon')
const {
  cloneDeep
} = require('lodash')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

describe('Helpers', () => {
  let chance,
    sandbox

  beforeEach(() => {
    chance = new Chance()
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should get the relative file path given the absolute path and the working directory', () => {
    const randomFolders = chance.n(chance.word, chance.natural({ min: 5, max: 10 }))
    const randomIndex = chance.natural({ min: 1, max: randomFolders.length - 2 })
    const absoluteFilePath = path.join(...randomFolders)
    const workingDirectory = path.join(...randomFolders.slice(0, randomIndex))
    const expectedResult = path.join(...randomFolders.slice(randomIndex))
    const actualResult = getRelativeFilePath(absoluteFilePath, workingDirectory)

    expect(actualResult).to.equal(expectedResult)
  })

  it('should return the number of newline characters given a source blob', () => {
    const randomNumberOfLines = chance.natural({ min: 5, max: 30 })
    const randomParagraphs = chance.n(chance.paragraph, randomNumberOfLines)
    const randomSourceBlob = randomParagraphs.join('\n')
    const result = getNumberOfLinesInSource(randomSourceBlob)

    expect(result).to.equal(randomNumberOfLines)
  })

  it('should get the contents of a file on the system', () => {
    const fileSource = chance.string()
    const randomFilePath = chance.string()

    sandbox.stub(fs, 'readFileSync').returns(fileSource)

    const result = getSourceFromFile(randomFilePath)

    expect(fs.readFileSync).to.have.callCount(1)
    expect(fs.readFileSync).to.be.calledWith(randomFilePath, { encoding: 'utf8' })

    expect(result).to.equal(fileSource)
  })

  it('should convert a source blob to an md5 digest', () => {
    const randomSourceBlob = chance.string()
    const digestResult = chance.string()
    const digestStub = sandbox.stub().returns(digestResult)
    const updateStub = sandbox.stub().returns({
      digest: digestStub
    })

    sandbox.stub(crypto, 'createHash').returns({
      update: updateStub
    })

    const result = getSourceDigest(randomSourceBlob)

    expect(crypto.createHash).to.have.callCount(1)
    expect(crypto.createHash).to.be.calledWith('md5')

    expect(updateStub).to.have.callCount(1)
    expect(updateStub).to.be.calledWith(randomSourceBlob)

    expect(digestStub).to.have.callCount(1)
    expect(digestStub).to.be.calledWith('hex')

    expect(result).to.equal(digestResult)
  })

  it('should pad a given array with null values', () => {
    const initialLength = chance.natural({ min: 5, max: 10 })
    const initialCoverageArray = chance.n(chance.string, initialLength)
    const coverallsSourceFile = {
      coverage: cloneDeep(initialCoverageArray)
    }
    const randomNumber = chance.natural({ min: 10, max: 20 })

    padWithNull(coverallsSourceFile, randomNumber)

    expect(coverallsSourceFile.coverage).to.have.length(initialLength + randomNumber)
    expect(coverallsSourceFile.coverage.splice(0, initialLength)).to.deep.equal(initialCoverageArray)

    for (let i = initialLength; i < coverallsSourceFile.coverage.length; i++) {
      expect(coverallsSourceFile.coverage[i]).to.equal(null)
    }
  })

  describe('getServiceName()', () => {
    function checkEnvironmentVariable (variable, expectedResult) {
      process.env[variable] = chance.string()
      const actualResult = getServiceName()

      expect(actualResult).to.equal(expectedResult)
      delete process.env[variable]
    }

    it('should return the correct CI that this is being run on', () => {
      checkEnvironmentVariable('TRAVIS', 'travis-ci')
      checkEnvironmentVariable('JENKINS_URL', 'Jenkins')
      checkEnvironmentVariable('CIRCLECI', 'Circle CI')
      checkEnvironmentVariable('bamboo_planKey', 'Bamboo')
      checkEnvironmentVariable('TF_BUILD', 'Team Foundation')
      checkEnvironmentVariable('TEAMCITY_VERSION', 'TeamCity')
    })

    it('should default to the COVERALLS_SERVICE_NAME environment variable', () => {
      const randomServiceName = chance.string()

      process.env.COVERALLS_SERVICE_NAME = randomServiceName

      const result = getServiceName()

      expect(result).to.equal(randomServiceName)

      delete process.env.COVERALLS_SERVICE_NAME
    })
  })
})
