'use strict'

const path = require('path')

const defaultConfig = {
  projectRoot: '.'
}

const getProgramConfig = givenConfig => {
  const config = Object.assign({}, defaultConfig, givenConfig)

  config.projectRoot = path.resolve(process.cwd(), config.projectRoot)

  return config
}

module.exports = {
  defaultConfig,
  getProgramConfig
}
