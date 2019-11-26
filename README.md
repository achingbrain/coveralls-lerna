# coveralls-lerna

A tool that can be used to parse test coverage results, merge reports together, and POST them to coveralls.io.

## The Problem

Monorepos tools like lerna run tests in lots of directories and leave `lcov.info` files all over the place.  It would be useful to aggregate these and see them on code-coverage sites like Coveralls.  This tool collates coverate reports, rewrites the paths in them and sends them to coveralls.

Based on the most excellent [@sourceallies/coveralls-merge](https://github.com/sourceallies/coveralls-merge)

## Installation

``` bash
npm coveralls-lerna --save-dev
```

## Usage

### CLI

```console
coveralls-lerna
```

### Repo Token

This tool reads the Coveralls repository token from the environment variable `COVERALLS_REPO_TOKEN`.  Failing to set this environment variable will cause the tool to throw an error.
