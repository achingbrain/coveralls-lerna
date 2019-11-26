'use strict'

const childProcess = require('child_process')

const USERNAME_EMAIL_REGEX = /(.+)\s<(.+)>/
const BRANCH_REGEX = /\* (.+)/
const COMMIT_MESSAGE_REGEX = /\w+\s(.+)/

function getHeadId () {
  return childProcess.execSync('git rev-parse HEAD').toString().trim()
}

function getCommitMessage () {
  const message = childProcess.execSync('git log -1 --pretty=%B --oneline').toString()

  return message.match(COMMIT_MESSAGE_REGEX)[1]
}

function getAuthorNameAndEmail () {
  const gitShow = childProcess.execSync('git show --format="%aN <%aE>" HEAD').toString()

  return gitShow.match(USERNAME_EMAIL_REGEX).slice(1, 3)
}

function getCommitterNameAndEmail () {
  const gitShow = childProcess.execSync('git show --format="%cN <%cE>" HEAD').toString()

  return gitShow.match(USERNAME_EMAIL_REGEX).slice(1, 3)
}

function getHead () {
  const [authorName, authorEmail] = getAuthorNameAndEmail()
  const [committerName, committerEmail] = getCommitterNameAndEmail()

  return {
    id: getHeadId(),
    author_name: authorName,
    author_email: authorEmail,
    committer_name: committerName,
    committer_email: committerEmail,
    message: getCommitMessage()
  }
}

function getBranch () {
  const branches = childProcess.execSync('git branch').toString()

  return branches.match(BRANCH_REGEX)[1]
}

function getRemotes () {
  const remotes = childProcess.execSync('git remote -v').toString().split('\n')

  return remotes
    .filter(remote => remote.endsWith('(push)'))
    .map(remote => {
      const tokens = remote.split(/\s/).filter(token => token.trim() !== '')

      return {
        name: tokens[0],
        url: tokens[1]
      }
    })
}

function getGitInfo () {
  return {
    head: getHead(),
    branch: getBranch(),
    remotes: getRemotes()
  }
}

module.exports = {
  getGitInfo
}
