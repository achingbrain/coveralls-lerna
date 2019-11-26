/* eslint-env mocha */
'use strict'

const {
  getGitInfo
} = require('../../../lib/util/git')
const expect = require('../../util/chai')
const Chance = require('chance')
const sinon = require('sinon')
const childProcess = require('child_process')

describe('Get Git Info', () => {
  let chance,
    sandbox,
    execSyncStub,
    id,
    authorName,
    authorEmail,
    committerName,
    committerEmail,
    message,
    branch,
    remotes

  function createFakeCommitMessage () {
    message = chance.paragraph()

    return `${chance.hash({ length: 7 })} ${message}`
  }

  function createFakeAuthorShow () {
    authorName = chance.pick([chance.name(), chance.first()])
    authorEmail = chance.email()

    return `${authorName} <${authorEmail}>${'\n'}`
  }

  function createFakeCommitterShow () {
    committerName = chance.pick([chance.name(), chance.first()])
    committerEmail = chance.email()

    return `${committerName} <${committerEmail}>${'\n'}`
  }

  function createFakeBranches () {
    const randomSize = chance.natural({ min: 2, max: 5 })
    const randomBranches = chance.n(chance.string, randomSize)
    const randomIndex = chance.natural({ min: 0, max: randomSize - 1 })

    branch = randomBranches[randomIndex]

    return randomBranches
      .map((branch, index) => {
        if (index === randomIndex) {
          return `* ${branch}`
        }

        return `  ${branch}`
      })
      .join('\n')
  }

  function createRandomRemote () {
    return {
      name: chance.word(),
      url: chance.url({ extensions: ['git'] })
    }
  }

  function createFakeRemotes () {
    remotes = chance.n(createRandomRemote, chance.natural({ min: 1, max: 3 }))

    return remotes
      .map(remote => `${remote.name}\t${remote.url} (fetch)\n${remote.name}\t${remote.url} (push)`)
      .join('\n')
  }

  beforeEach(() => {
    chance = new Chance()
    sandbox = sinon.sandbox.create()

    id = chance.hash()

    execSyncStub = sandbox.stub(childProcess, 'execSync').returns()

    execSyncStub
      .withArgs('git log -1 --pretty=%B --oneline')
      .returns({
        toString: createFakeCommitMessage
      })
    execSyncStub
      .withArgs('git show --format="%aN <%aE>" HEAD')
      .returns({
        toString: createFakeAuthorShow
      })
    execSyncStub
      .withArgs('git show --format="%cN <%cE>" HEAD')
      .returns({
        toString: createFakeCommitterShow
      })
    execSyncStub
      .withArgs('git branch')
      .returns({
        toString: createFakeBranches
      })
    execSyncStub
      .withArgs('git remote -v')
      .returns({
        toString: createFakeRemotes
      })
    execSyncStub
      .withArgs('git rev-parse HEAD')
      .returns({
        toString: () => ({ trim: () => id })
      })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should retrieve the correct git information', () => {
    const actualGitInfo = getGitInfo()
    const expectedGitInfo = {
      head: {
        id,
        author_name: authorName,
        author_email: authorEmail,
        committer_name: committerName,
        committer_email: committerEmail,
        message
      },
      branch,
      remotes
    }

    expect(expectedGitInfo).to.deep.equal(actualGitInfo)
  })
})
