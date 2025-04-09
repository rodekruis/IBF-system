# IBF-system

## Introduction

**NOTE**: Some background on IBF-terminology (e.g. triggers) is
expected. This can be expanded on later.

This is the repository for the IBF-system. It includes a.o.:

1. An [API-service (backend)](./services/API-service/)

- which accepts input from various IBF-pipelines, that upload impact forecast data to the IBF-system on regular intervals. (See 'Dependencies' below.)
- and which lets the IBF-dashboard - or other authorized accounts - retrieve data from the IBF-database.

2. An [IBF-dashboard (frontend)](./interfaces/IBF-dashboard/)

- showing all impact forecast data - either leading to a trigger or not - in the IBF-portal

## Dependencies

- The IBF-dashboard will not show meaningful information (or even load correctly) without impact forecast data being uploaded to it.
- This data is provided by separate IBF-pipelines, that are not part of this repository, but are strongly connected.
- See the 510 IBF Project Document for more info and links to the 510-instances of these pipelines per disaster-type.
- For development/testing purposes, there are mock-endpoints and mock-data available to replace the need for these pipelines. (See 'Load local database with data' below.)

## Getting Started

### Setup a local development-environment:

- Install Git: <https://git-scm.com/download/>
- Install Node.js: <https://nodejs.org/en/download/>

  - Install the version specified in the [`.node-version`](.node-version)-file.
  - To prevent conflicts between projects or components using other versions of Node.js it is recommended to use a 'version manager'.

    - [NVM - Node Version Manager](http://nvm.sh/) (for macOS/Linux).

    - [NVM for Windows](https://github.com/coreybutler/nvm-windows) (for Windows)

    - [FNM](https://nodejs.org/en/download/package-manager/#fnm) (for Windows/macOS/Linux)

### Installation

1. Clone the repository

2. Setup env variables:

   `cp example.env .env`

   Fill in the .env variables with someone who has them.

3. Run `npm run install:interface`

### Start apps

From root run

- `npm run start:services`
- `npm run start:interface`

### Load (local) database with data

When running Docker locally, a database-container will start (as opposed to remote servers, which
are connected to a database-server). For setting up a fully working version of the IBF-dasbhoard 2 steps are needed.

1. Load initial raster data

- Download [raster-files.zip](https://510ibfsystem.blob.core.windows.net/rasters/raster-files.zip)
- Unzip it in `services/API-service/geoserver-volume/raster-files` folder, such that that folder now has subfolders:
  - `input`-folder: static raster files that are served through 'geoserver' to the 'IBF-dashboard'
  - `mock-output`-foldermock output raster files that are used by the mock-endpoint (see below)
  - `output`-folder: currently empty, but any raster files that are posted to the API-service by IBF-pipelines (or mock endpoint) will be stored here, and Geoserver will be able to read them from here.

2. Seed and mock database

- Login via [Swagger login endpoint](http://localhost:4000/docs#/--%20user%20--/UserController_login) > See Authentication instruction at top of Swagger-page.
- Seed via [Swagger seed endpoint](http://localhost:4000/docs#/---%20mock%2Fseed%20data%20---/ScriptsController_resetDb)
- Mock via [Swagger mock-all endpoint](http://localhost:4000/docs#/---%20mock%2Fseed%20data%20---/ScriptsController_mockAll)

### Installation result

These commands will install the IBF-system with listeners at,

1. [localhost:4000/docs](http://localhost:4000/docs) for the API-service documentation
2. \*development only - [localhost:4200](http://localhost:4200) for the web
   interface

### Load base data

1. Load Geoserver source data
   - Download raster-files.zip
   - Unzip the files using apt install unzip and unzip raster-files.zip, into services/API-service/geoserver-volume/raster-files/
2. Seed database: docker compose exec ibf-api-service npm run seed
3. Run all mock scenarios via Swagger: api/scripts/mock-all

## Contributing to IBF

Read our [CONTRIBUTING](docs/CONTRIBUTING.md) guide.

## Glossary

| Term          | Definition (_we_ use)                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `version`     | A 'number' specified in the [`SemVer`](https://semver.org/spec/v2.0.0.html)-format: `0.1.0`               |
| `tag`         | A specific commit or point-in-time on the git-timeline; named after a version, i.e. `v0.1.0`              |
| `release`     | A fixed 'state of the code-base', [published on GitHub](https://github.com/rodekruis/IBF-system/releases) |
| `deployment`  | An action performed to get (released) code running on an environment                                      |
| `environment` | A machine that can run code (with specified settings); i.e. a server or VM, or your local machine         |
