'use strict'

const path = require('path')
const {
  getRelativeFilePath,
  getNumberOfLinesInSource,
  getSourceFromFile,
  getSourceDigest,
  padWithNull,
  doesFilexExistOn
} = require('../util/helpers')

function getCoverageFromLine (line) {
  return line.slice(3).split(',').map(number => Number(number))
}

function convertLcovSectionToCoverallsSourceFile (lcovSection, config) {
  const { projectRoot, workingDirectory } = config;
  const lcovSectionLines = lcovSection.trim().split('\n')
  const coverallsSourceFile = {
    coverage: []
  }

  let numberOfSourceFileLines = 0; let lastLine = 1

  lcovSectionLines.forEach(line => {
    if (line.startsWith('SF:')) {
      let absoluteFilePath = line.slice(3)

      // try to append workingDirectory and to do a check again
      if (!doesFilexExistOn(absoluteFilePath)) {
        absoluteFilePath = path.join(workingDirectory, absoluteFilePath);
      }

      const fileSource = getSourceFromFile(absoluteFilePath)

      coverallsSourceFile.name = getRelativeFilePath(absoluteFilePath, projectRoot)
      coverallsSourceFile.source_digest = getSourceDigest(fileSource)

      numberOfSourceFileLines = getNumberOfLinesInSource(fileSource)
    }

    if (line.startsWith('DA:')) {
      const [lineNumber, numberOfHits] = getCoverageFromLine(line)

      if (lineNumber !== 0) {
        padWithNull(coverallsSourceFile, lineNumber - lastLine - 1)

        coverallsSourceFile.coverage.push(numberOfHits)

        lastLine = lineNumber
      }
    }
  })

  padWithNull(coverallsSourceFile, numberOfSourceFileLines - lastLine)

  return coverallsSourceFile
}

function emptySections (section) {
  return section.trim() !== ''
}

module.exports = async (reportFile, config) => {
  const lcovReportFilePath = path.resolve(config.projectRoot, reportFile)
  const lcovContents = getSourceFromFile(lcovReportFilePath)
  const lcovSections = lcovContents.split('end_of_record\n')
  const result = lcovSections
    .filter(emptySections)
    .map(section => convertLcovSectionToCoverallsSourceFile(section, config))

  return result
}
