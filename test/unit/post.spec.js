/* eslint-env mocha */
'use strict'

const post = require('../../lib/post')
const expect = require('../util/chai')
const Chance = require('chance')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

describe('POST Data to Coveralls', () => {
  let chance,
    sandbox

  before(() => {
    proxyquire.noCallThru()
  })

  beforeEach(() => {
    chance = new Chance()
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should throw an error if the COVERALLS_REPO_TOKEN environment variable is not defined', () => {
    delete process.env.COVERALLS_REPO_TOKEN

    const badSendCall = post({})

    expect(badSendCall).to.be.eventually.rejectedWith('COVERALLS_REPO_TOKEN environment variable not set')
  })

  describe('Given the COVERALLS_REPO_TOKEN variable is set', () => {
    let repoToken,
      serviceName,
      serviceJobId,
      sourceFiles,
      git,
      send,
      postWithMocks

    beforeEach(() => {
      repoToken = chance.word()
      serviceName = chance.word()
      serviceJobId = chance.word()
      sourceFiles = chance.word()
      git = chance.word()
      send = sinon.stub()

      process.env.COVERALLS_REPO_TOKEN = repoToken

      postWithMocks = proxyquire('../../lib/post', {
        'request-promise-native': send,
        './util/git': {
          getGitInfo: sinon.stub().returns(git)
        },
        './util/helpers': {
          getServiceName: sinon.stub().returns(serviceName),
          getServiceJobId: sinon.stub().returns(serviceJobId)
        }
      })
    })

    afterEach(() => {
      delete process.env.COVERALLS_REPO_TOKEN
    })

    it('should send a POST request to the Coveralls API', () => {
      send.returns({
        url: 'hello'
      })

      const expectedPostObject = {
        url: 'https://coveralls.io/api/v1/jobs',
        method: 'post',
        form: {
          json: JSON.stringify({
            repo_token: repoToken,
            source_files: sourceFiles,
            git
          })
        },
        json: true
      }

      postWithMocks(sourceFiles)

      expect(send).to.have.callCount(1)
      expect(send).to.be.deep.calledWith(expectedPostObject)
    })

    it('should throw an error if the request was unsuccessful', () => {
      const error = chance.string()

      send.returns({
        error: true,
        message: error
      })

      expect(postWithMocks(sourceFiles)).to.eventually.rejectedWith(error)
    })
  })
})
