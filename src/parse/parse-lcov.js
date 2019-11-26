import {
  getRelativeFilePath,
  getNumberOfLinesInSource,
  getSourceFromFile,
  getSourceDigest,
  padWithNull
} from '../util/helpers'

const path = require('path')

function getCoverageFromLine (line) {
  return line.slice(3).split(',').map(number => Number(number))
}

function convertLcovSectionToCoverallsSourceFile (lcovSection, projectRoot) {
  const lcovSectionLines = lcovSection.trim().split('\n')
  const coverallsSourceFile = {
    coverage: []
  }

  let numberOfSourceFileLines = 0; let lastLine = 1

  lcovSectionLines.forEach(line => {
    if (line.startsWith('SF:')) {
      const absoluteFilePath = line.slice(3)
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

export default (reportFile, config) => new Promise(resolve => {
  const lcovReportFilePath = path.resolve(config.projectRoot, reportFile)
  const lcovContents = getSourceFromFile(lcovReportFilePath)
  const lcovSections = lcovContents.split('end_of_record\n')
  const result = lcovSections
    .filter(emptySections)
    .map(section => convertLcovSectionToCoverallsSourceFile(section, config.projectRoot))

  resolve(result)
})
