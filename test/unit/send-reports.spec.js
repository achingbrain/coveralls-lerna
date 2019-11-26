/* eslint-env mocha */
'use strict'

const config = require('../../lib/util/config')
const expect = require('../util/chai')
const Chance = require('chance')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

describe('sendReports', () => {
  let chance,
    sandbox,
    givenReports,
    parseStub,
    mergeResults,
    mergeStub,
    postStub,
    givenConfig,
    programConfig,
    getProgramConfigStub,
    sendReportsWithMocks,
    parseResults

  before(() => {
    proxyquire.noCallThru()
  })

  before(async () => {
    chance = new Chance()
    sandbox = sinon.sandbox.create()

    givenConfig = chance.string()
    programConfig = chance.string()
    mergeResults = chance.string()
    givenReports = chance.n(chance.string, 4)
    parseResults = chance.n(chance.string, 4)
    parseStub = sandbox.stub()

    for (let i = 0; i < parseResults.length; i++) {
      parseStub.onCall(i).returns(parseResults[i])
    }

    mergeStub = sandbox.stub().returns(mergeResults)
    postStub = sandbox.stub()
    getProgramConfigStub = sandbox.stub(config, 'getProgramConfig').returns(programConfig)

    sendReportsWithMocks = proxyquire('../../lib/send-reports', {
      './parse': parseStub,
      './merge': mergeStub,
      './post': postStub,
      './util/config': {
        getProgramConfig: getProgramConfigStub
      }
    })

    await sendReportsWithMocks(givenReports, givenConfig)
  })

  after(() => {
    sandbox.restore()
  })

  it('should get the program configuration', () => {
    expect(getProgramConfigStub).to.have.callCount(1)
    expect(getProgramConfigStub).to.be.calledWith(givenConfig)
  })

  it('should parse each report', () => {
    expect(parseStub).to.have.callCount(givenReports.length)

    givenReports.forEach(report => {
      expect(parseStub).to.be.calledWith(report, programConfig)
    })
  })

  it('should merge the results together', () => {
    expect(mergeStub).to.have.callCount(1)
    expect(mergeStub).to.be.calledWith(parseResults)
  })

  it('should POST the results to Coveralls.io', () => {
    expect(postStub).to.have.callCount(1)
    expect(postStub).to.be.calledWith(mergeResults)
  })
})
