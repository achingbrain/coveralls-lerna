'use strict'

const path = require('path')
const {
  parseString
} = require('xml2js')
const {
  getSourceFromFile,
  getSourceDigest,
  getNumberOfLinesInSource,
  padWithNull,
  getRelativeFilePath
} = require('../util/helpers')

function getCoverageFromLine (line) {
  return [line.$.nr, line.$.ci]
}

function convertJavaSourceFileToCoverallsSourceFile (javaSourceFileXML, javaPackagePath, config) {
  const { workingDirectory, projectRoot } = config
  const absoluteJavaFilePath = path.resolve(workingDirectory, javaPackagePath, javaSourceFileXML.$.name)
  const relativeJavaFilePath = getRelativeFilePath(absoluteJavaFilePath, projectRoot)
  const javaFileSource = getSourceFromFile(absoluteJavaFilePath)
  const numberOfSourceFileLines = getNumberOfLinesInSource(javaFileSource)
  const coverallsSourceFile = {
    name: relativeJavaFilePath,
    coverage: [],
    source_digest: getSourceDigest(javaFileSource)
  }

  let lastLine = 0

  javaSourceFileXML.line.forEach(line => {
    const [lineNumber, numberOfHits] = getCoverageFromLine(line)

    padWithNull(coverallsSourceFile, lineNumber - lastLine - 1)

    coverallsSourceFile.coverage.push(numberOfHits)

    lastLine = lineNumber
  })

  padWithNull(coverallsSourceFile, numberOfSourceFileLines - lastLine)

  return coverallsSourceFile
}

function handleJavaPackage (javaPackageXML, config) {
  const javaPackagePath = javaPackageXML.$.name

  return javaPackageXML.sourcefile.map(javaSourceFileXML =>
    convertJavaSourceFileToCoverallsSourceFile(javaSourceFileXML, javaPackagePath, config)
  )
}

function combineArrays (a, b) {
  return a.concat(b)
}

module.exports = (reportFile, config) => new Promise((resolve, reject) => {
  const jacocoReportFilePath = path.resolve(config.projectRoot, reportFile)
  const jacocoContents = getSourceFromFile(jacocoReportFilePath)

  parseString(jacocoContents, (error, xml) => {
    if (error) {
      return reject(new Error(`Failed to parse XML file at ${jacocoReportFilePath}`))
    }

    const result = xml.report.package
      .map(javaPackageXML => handleJavaPackage(javaPackageXML, config))
      .reduce(combineArrays)

    resolve(result)
  })
})
