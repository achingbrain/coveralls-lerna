'use strict'

const request = require('request-promise-native')
const {
  getServiceName,
  getServiceJobId
} = require('./util/helpers')
const {
  getGitInfo
} = require('./util/git')

async function post (sourceFiles) {
  const json = {
    source_files: sourceFiles,
    git: getGitInfo()
  }

  if (process.env.COVERALLS_REPO_TOKEN) {
    json.repo_token = process.env.COVERALLS_REPO_TOKEN
  } else {
    json.service_name = getServiceName()
    json.service_job_id = getServiceJobId()
  }

  if (!json.repo_token && !json.service_name && !json.service_job_id) {
    throw new Error('COVERALLS_REPO_TOKEN environment variable not set and could not detect service name or service job id')
  }

  try {
    const response = await request({
      url: 'https://coveralls.io/api/v1/jobs',
      method: 'post',
      form: {
        json: JSON.stringify(json)
      },
      json: true
    })

    if (response.error) {
      throw new Error(response.message)
    }

    return response.url
  } catch (err) {
    if (err.responseBody) {
      let message

      try {
        const body = await err.responseBody
        message = JSON.parse(body.toString('utf8')).message
      } catch (err2) {

      }

      if (message) {
        throw new Error(message)
      }
    }

    throw err
  }
}

module.exports = post
