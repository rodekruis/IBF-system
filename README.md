# IBF-system

## Status

| Component                 | Build Status                                                                                                                                                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cypress Integration Tests | [![IBF-system](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/detailed/jkaw7k/master&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/jkaw7k/runs) |

## Introduction

**NOTE**: For now some background on IBF-terminology (e.g. triggers) is
expected. This can be expanded on later.

This is the repository for the IBF-system. It includes 2 main folders.

1. [Services (backend)](./services/)

-   API-service 
  - which accepts input from various IBF-pipelines, that upload impact forecast data to the IBF-system on regular intervals. (See 'Dependencies' below.)
  - and which lets the IBF-dashboard - or other authorized accounts - retrieve data from the IBF-database. 

2. [Interfaces (frontend)](./interfaces/)

-   IBF-dashboard
  - showing all impact forecast data - either leading to a trigger or not - in a visual portal

## Dependencies

- The IBF-dashboard will not show meaningful information (or even load correctly) without impact forecast data being uploaded to it.
- This data is provided by separate IBF-pipelines, that are not part of this repository, but are strongly connected.
- See the 510 IBF Project Document for more info and links to the 510-instances of these pipelines per disaster-type.
- For development/testing purposes, there are mock-endpoints and mock-data available to replace the need for these pipelines. (See 'Load local database with data' below.)

## System design (draft)

![IBF-system design (draft)](./system-design/ibf-system-design.PNG)

## Installation

1. Setup env variables:

    `cp example.env .env`

    Fill in the .env variables with someone who has them.

2. Set up secret values for IBF-pipeline:
   `cp services/IBF-pipeline/pipeline/secrets.py.template services/IBF-pipeline/pipeline/secrets.py`

    Fill in the variables with someone who has them.

3. (Only if connecting local setup to remote database): Whitelist your machine IP at the database server

### Using Docker

```
docker-compose -f docker-compose.yml up # for production

docker-compose up # for development

docker-compose -f docker-compose.yml -f docker-compose.override.yml up # for development (explicit)

```

### Without Docker (for local development)

For local development you can also run and start the services and interface
without docker:

For API-service
- `cp .env services/API-service/.env` 
- `cd services/API-service`
- `npm run start:dev`

For IBF-dashboard
- `cd interfaces/IBF-dashboard`
- `npm start`

Suggestion: load everything through Docker, except IBF-dashboard. This has the benefit that changes in front-end code are immediately reflected, instead of having to rebuild.
- `docker-compose up -d`
- `docker-compose stop ibf-dashboard`
- `cd interfaces/IBF-dashboard`
- `npm start`

### Load (local) database with data

When running Docker locally, a database-container will start (as opposed to remote servers, which
are connected to a database-server). For setting up a fully working version of the IBF-dasbhoard 2 steps are needed.
1. Seed database with initial static data
  - docker-compose exec ibf-api-service npm run seed
2. Load initial raster data
  - Get the file `raster-files.zip` from [this link](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?folderid=0fa454e6dc0024dbdba7a178655bdc216&authkey=AcqhM85JHZY8cc6H7BTKgO0&expiration=2021-11-29T23%3A00%3A00.000Z&e=qkUx50).
  - Unzip it in `services/API-service/geoserver-volume/raster-files` folder, such that that folder now has subfolders:
    - `input`-folder: static raster files that are served through 'geoserver' to the 'IBF-dashboard'
    - `mock-output`-foldermock output raster files that are used by the mock-endpoint (see below)
    - `output`-folder: currently empty, but any raster files that are posted to the API-service by IBF-pipelines (or mock endpoint) will be stored here, and Geoserver will be able to read them from here. 
3. Post 1st batch of dynamic data to database
  - by calling mock-endpoint
    - see API documentation: http://localhost:3000/docs/#/scripts
    - run for all countries and disaster-type at once: http://localhost:3000/docs/#/scripts/ScriptsController_mockAll 
    - or run for 1 country and 1 disaster-type: http://localhost:3000/docs/#/scripts/ScriptsController_mockDynamic
  - or by having external pipeline make a call to IBF-system

Adding new data

-   Any new static data needs to be imported using a seed-script + corresponding
    TypeORM entity
-   This includes e.g. geojson data
-   The only exception are raster-files, which need to be included in data.zip [here](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/Gedeelde%20%20documenten/Forms/AllItems.aspx?id=%2Fsites%2F510%2DCRAVK%2D510%2FGedeelde%20%20documenten%2F%5BRD%5D%20Impact%2Dbased%20forecasting%2FGeneral%5FData%2FProduction%20Data&p=true&originalPath=aHR0cHM6Ly9yb2Rla3J1aXMuc2hhcmVwb2ludC5jb20vc2l0ZXMvNTEwLUNSQVZLLTUxMC9fbGF5b3V0cy8xNS9ndWVzdGFjY2Vzcy5hc3B4P2ZvbGRlcmlkPTBmYTQ1NGU2ZGMwMDI0ZGJkYmE3YTE3ODY1NWJkYzIxNiZhdXRoa2V5PUFjcWhNODVKSFpZOGNjNkg3QlRLZ08wJmV4cGlyYXRpb249MjAyMS0xMS0yOVQyMyUzYTAwJTNhMDAuMDAwWiZydGltZT1zekJQVnJfSjJFZw)
    and transfered to all relevant servers.

### Installation result

These commands will install the IBF-system with listeners at,

1. [localhost:3000/docs](http://localhost:3000/docs) for the API-service documentation
2. \*development only - [localhost:4200](http://localhost:4200) for the web
   interface

### Troubleshoot installation issues
Please read the troubleshoot guidlelines to support the insatllation of IBF in the
[TROUBLESHOOT.md](/docs/TROUBLESHOOT.md)

## Integration tests

### Cypress

We use Cypress for automated integration testing in this project.
Installation: 0. (Potentially on Ubuntu?:
`sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb`)

1.  In root folder `npm install --only=dev`

-   This should download and install Cypress
-   If it fails, find out why and/or install Cypress in some other way (e.g.
    `npm install cypress`)

2.  Set necessary environment variables, for example by using a CYPRESS\_\*
    prefix (see https://docs.cypress.io/guides/guides/environment-variables for
    more)

-   e.g. on Windows Powershell: $env:CYPRESS_LOGIN_USER = "<login>"

3.  Run `npm run cypress:open`

-   When the Cypress window opens click on 'Run X integration specs'
-   Alternatively run `npm run cypress:start` to run from commandline

## Releases

See notable changes and the currently release version in the
[CHANGELOG](CHANGELOG.md).

### Release Checklist

-   [ ] Check if the latest integration tests passed on
        [Cypress Dashboard](https://dashboard.cypress.io/projects/jkaw7k/runs?branches=%5B%5D&committers=%5B%5D&flaky=%5B%5D&page=1&status=%5B%5D&tags=%5B%5D&timeRange=%7B%22startDate%22%3A%221970-01-01%22%2C%22endDate%22%3A%222038-01-19%22%7D).
-   [ ] Pick a tag to release. Let's say we want to release the tag
        [v0.27.9](https://github.com/rodekruis/IBF-system/releases/tag/v0.27.9)
        on GitHub.
-   [ ] Click the 'Edit Tag' button.
-   [ ] Enter the release title to v0.27.9.
-   [ ] Optional: Enter the release description from the
        [CHANGELOG](CHANGELOG.md) file.
-   [ ] Click the 'Publish Release' button.

The above steps should trigger the
[release webhook](https://github.com/rodekruis/IBF-system/settings/hooks/240449523)
which updates the [staging environment](https://ibf.510.global/login) to the
published release. This takes a while (approx 20 mins) to update.

## Deployment

### To "test" environment

-   Make sure to verify if the environment-settings are appropriately set on the
    test VM before merging the PR.
-   Merged PR's to 'master' branch are automatically deployed to the
    test-server. (via [webhook](tools/webhook.service), see:
    [/tools#GitHub-webhook](tools/README.md#github-webhook))

### To "stage" environment

-   Make sure to verify if the environment-settings are appropriately set on the
    stage VM before publishing the release.
-   When a [release](#release-checklist) is published, it is automatically
    deployed to the staging-server.

### To "production" environment

-   Make sure to verify if the [environment variables](./example.env) are
    appropriately set on the VM.
-   Manually run the [deploy script](./tools/deploy.sh) with the tag which
    should be deployed for the specific country.

## Contributing to IBF

Please read the contributing guidlelines in the
[CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Adding a new country

For adding a new country to the IBF-system, a lot of components are already
generic, and thus automized. But also quit some manual steps are needed at the
moment. This is intended to be improved in the future. The list below is
intended to give a full overview. It is not however meant to be detailed enough
to execute each step, without further knowledge. Ask a developer who knows more.

### Adding country with disaster type _Floods_

NOTE: outdated!! Check with developers first.

1. IBF-API-Service
    - Users:
        - Add user for country to src/scripts/users.json
        - Add country to admin-user
    - Country
        - Add country in src/scripts/countries.json
    - Upload through 'npm run seed' from API-service
2. Data for database (look at existing countries and files for examples in terms
   of format)
    - Save admin-area-boundary file (.shp) for agreed upon admin-level as
      geojson (with extension .json) with the right column names in
      `services/API-service/src/scripts/git-lfs/`
    - Save Glofas*stations_locations_with_trigger_levels*<countryCodeISO3>.csv
      in the same folder
    - Save Glofas*station_per_admin_area*<countryCodeISO3>.csv in the same
      folder
        - which admin-areas are triggered if station X is triggered?
        - note: this should include all admin-areas. If not mapped to any
          station, use 'no_station'
    - Potentially add extra code in seed-scripts (seed-amin-area.ts /
      seed-glofas-station.ts / etc.) to process new data correctly.
    - Run seed script of IBF-API-service
    - NOTE: we are in a migration, where we want to move new data as much as
      possible to this new seed-script set up. So also for other data, not
      mentioned here, the goal is to upload this via seed-scripts as well. Some
      other data that is not yet included in seed-script
        - COVID risk data (.csv) > uploaded through specifically created
          endpoint
3. Geodata for IBF-pipeline and IBF-geoserver (look at existing countries and
   files for examples in terms of format)
    - Save in `services/IBF-pipeline/pipeline/data` in the right subfolder ..
        - Flood extent raster (for at least 1 return period) + an 'empty' raster
          of the same exten/pixel size. (.tif)
        - Population (.tif)
        - Grassland + cropland (.tif)
    - When deploying to other environments (local/remote) this data needs to be
      transfered (e.g. as data.zip through WinSCP or similar)
4. IBF-pipeline
    - add countryCodeISO3 to .env (for development settings, replace by ONLY
      that code)
    - add country-specific settings to settings.py (e.g. right links to
      abovementioned data)
        - with model = 'glofas'
    - add country-specific settings to secrets.py
    - add dummy-trigger-station to glofasdata.py with forecast-value that
      exceeds trigger-value
    - Run runPipeline.py (`python3 runPipeline.py`) to test pipeline.
5. Geoserver
    - Manually create new stores+layers in
      [Geoserver interface of test-vm](https://ibf-test.510.global/geoserver/web)
        - flood*extent*<lead-time>\_<countryCodeISO3> for each lead-time
        - population\_<countryCodeISO3>
        - grassland\_<countryCodeISO3>
        - cropland\_<countryCodeISO3>
    - Test that the specifics layers are viewable in the dashboard now
    - When done, commit the (automatically) generated content in
      IBF-pipeline/geoserver-workspaces to Github
    - This will prevent you from having to do the same for another server, or if
      your content is lost somehow
6. IBF-dashboard
    - Test dashboard by logging in through admin-user or country-specific user
7. Specifics/Extras
    - Whatsapp:
        - create whatsapp group
        - paste link in IBF-pipeline/pipeline/lib/notifications/formatInfo.py
    - EAP-link
        - create bookmark in Google Docs at place where Trigger Model section
          starts
        - paste link (incl bookmark) in countries seed-script
        - paste link (excl bookmark) in
          IBF-pipeline/pipeline/lib/notifications/formatInfo.py
    - Logo's
        - Get logo(s) (.png)
        - Paste in IBF-dashboard/app/assets/logos + add reference to each logo
          in countries seed-script
        - Paste in
          IBF-pipeline/pipeline/lib/notifications/logos/email-logo-<countryCodeISO3>.png
        - Upload logo to mailchimp + retrieve shareable link + copy this in
          IBF-pipeline/pipeline/lib/notifications/formatInfo.py
    - Mailchimp segment
        - Add new tag '<countryCodeISO3>' to at least 1 user
        - Create new segment '<countryCodeISO3>' defined as users with tag
          '<countryCodeISO3>'.
        - Get segmentId of new segment
        - Paste this in IBF-pipeline/pipeline/secrets.py
    - EAP-actions
        - Summarize actions from EAP-document + define 1 Area of Focus per
          EAP-action
        - Add to API-service/seed-data/EAP-actions.json
        - run 'npm run seed' from API-service

### Adding country with disaster type _Heavy rainfall_

NOTE: outdated!! Check with developers first.

-   Follow the 'flood' manual above as much as possible, with notable exceptions
-   Input data database
    -   Rainfall_station_locations_with_trigger_levels.csv > currently not
        included in seed-script yet, but manually uploaded (through runSetup.py)
-   Input data pipeline
    -   There is no equivalent input to the flood extent raster. This is created
        in the pipeline.
-   Add country in IBF-pipeline settings.py with model = 'rainfall'
-   Save geoserver output as rainfall*extent*<leadTime>\_<countrYCode>

## Glossary

| Term          | Definition (_we_ use)                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `version`     | A 'number' specified in the [`SemVer`](https://semver.org/spec/v2.0.0.html)-format: `0.1.0`               |
| `tag`         | A specific commit or point-in-time on the git-timeline; named after a version, i.e. `v0.1.0`              |
| `release`     | A fixed 'state of the code-base', [published on GitHub](https://github.com/rodekruis/IBF-system/releases) |
| `deployment`  | An action performed to get (released) code running on an environment                                      |
| `environment` | A machine that can run code (with specified settings); i.e. a server or VM, or your local machine         |
