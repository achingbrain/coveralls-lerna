'use strict'

const bent = require('bent')
const {
  getServiceName,
  getServiceJobId
} = require('./util/helpers')
const {
  getGitInfo
} = require('./util/git')

async function post (sourceFiles) {
  const repoToken = process.env.COVERALLS_REPO_TOKEN

  if (!repoToken && !process.env.TRAVIS) {
    throw new Error('COVERALLS_REPO_TOKEN environment variable not set')
  }

  const send = bent('https://coveralls.io', 'POST', 'json', 200)
  const response = await send('/api/v1/jobs', {
    repo_token: repoToken,
    service_name: getServiceName(),
    service_job_id: getServiceJobId(),
    source_files: sourceFiles,
    git: getGitInfo()
  })

  if (response.error) {
    throw new Error(response.message)
  }

  return response.url
}

module.exports = post
