# coveralls-lerna

[![Build Status](https://travis-ci.org/achingbrain/coveralls-lerna.svg?branch=master)](https://travis-ci.org/achingbrain/coveralls-lerna) [![Coverage Status](https://coveralls.io/repos/github/achingbrain/coveralls-lerna/badge.svg?branch=master)](https://coveralls.io/github/achingbrain/coveralls-lerna?branch=master)

A tool that can be used to parse test coverage results, merge reports together, and POST them to coveralls.io.

## The Problem

Mono-repo tools like lerna run tests in lots of directories and leave `lcov.info` files all over the place.  It would be useful to aggregate these and see them on code-coverage sites like Coveralls.  This tool collates coverate reports, rewrites the paths in them and sends them to coveralls.

Based on the most excellent [@sourceallies/coveralls-merge](https://github.com/sourceallies/coveralls-merge)

## Installation

``` bash
npm i coveralls-lerna --save-dev
```

## Usage

### CLI

```console
coveralls-lerna
```

### Repo Token

This tool reads the Coveralls repository token from the environment variable `COVERALLS_REPO_TOKEN`.  If this is not set it tries to guess the CI environment and job ID, if if can't do that either it will throw an error.
