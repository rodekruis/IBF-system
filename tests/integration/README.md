# Integration testing suite <!-- omit from toc -->

> [!NOTE]
> This documentation is about the "Integration test suite" _only_;
> For other testing, see the [root-README](../README.md).

## Table of Contents <!-- omit from toc -->

- [Installation](#installation)
  - [Install test dependencies](#install-test-dependencies)
  - [Set necessary Environment-variables](#set-necessary-environment-variables)
- [Running tests](#running-tests)
  - [Using the command-line](#using-the-command-line)

---

## Installation

Clone the repository and run local Docker environment following the general [installation-documentation](../README.md#getting-started).

### Install test dependencies

From the repository root-folder, move into this folder: `cd ./tests/integration/`

Then, in _this_ folder, run:

```shell
npm install
```

### Set necessary Environment-variables

Make sure to fill in all relevant variables in your local `./.env`-file.

## Running tests

Before running the tests, make sure the local API-service is running.

### Using the command-line

```shell
npm run test
```

Or run one particular test file, by passing (part of) the name of the file. 

```shell
npm run test uga-floods
```