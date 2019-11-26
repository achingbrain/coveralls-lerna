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
  const creds = {}

  if (process.env.COVERALLS_REPO_TOKEN) {
    creds.repo_token = process.env.COVERALLS_REPO_TOKEN
  } else {
    creds.service_name = getServiceName()
    creds.service_job_id = getServiceJobId()
  }

  if (!creds.repo_token && !creds.service_name && !creds.service_job_id) {
    throw new Error('COVERALLS_REPO_TOKEN environment variable not set and could not detect service name or service job id')
  }

  try {
    const response = await request({
      url: 'https://coveralls.io/api/v1/jobs',
      method: 'post',
      form: {
        json: JSON.stringify({
          ...creds,
          source_files: sourceFiles,
          git: getGitInfo()
        })
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
