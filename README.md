# IBF-system

**NOTE**: For now some background on IBF-terminology (e.g. triggers) is
expected. This can be expanded on later.

This is the repository for the IBF-system. It includes 3 main components.

1. [Trigger model development](./trigger-model-development/)

-   This contains the exploratory analysis for developing a trigger-model for a
    given country and disaster-type.
-   It might include (in the future) a lot of shared code between countries and
    disaster types, and even (automated) tools to aid analysts to develop
    trigger models.
-   The output is a `trigger script` which determines (per country/disaster
    type) when and where a trigger is reached.

2. [Services (backend)](./services/)

-   The `trigger script` is subsequently automated through (e.g. a daily
    running) service.
-   Results (as well as other related data) are stored in a database
-   Database content is returned through API-calls to some interface

3. [Interfaces (frontend)](./interfaces/)

-   Visualization of model results through dashboards
-   Dashboards might move from read-only to write-applications, where users can
    also add (secondary) data through an interface

## System design (draft)

![IBF-system design (draft)](./system-design/ibf-system-design.PNG)

## Installation

1. Setup env variables:

    `cp example.env .env`

    Fill in the .env variables with someone who has them.

2. Whitelist your machine IP at the database server

### Using Docker

```
docker-compose -f docker-compose.yml up # for production

docker-compose up # for development

docker-compose -f docker-compose.yml -f docker-compose.override.yml up # for development (explicit)
```

### Without Docker (for local development)

For local development you can also run and start the services and interface
without docker:

`cp .env services/API-service/.env` `npm run start`

### NOTE on local database

Locally, a database-container will start (as opposed to remote servers, which are connected to a database-server).
To currently fill this database with data
- dump + restore 'IBF-static-input' schema from 'geonode_datav3' remote database
- run the IBF-API-service seed script to create + fill 'IBF-app' tables
- run the script /services/API-service/src/sql/IBF-database-scripts.sql'
- run the IBF-pipeline to create + get initial fill of 'IBF-pipeline-output' schema's.

We are in a migration, where as much as possible we will load new static data from seed-scripts. This will make sure it ends up automatically on all servers.
This is however not yet always the case:
  - geodata (raster/shapefiles used by pipeline/geoserver) > for these sources, you still need to include it in data.zip + transfer (e.g. via WinSCP or similar) to all servers)
  - if for other data, for some reason, it is not possible/handy to add new data via seed-script, keep the following in mind
    - this means you're adding data to your local db through e.g.
      - manual upload (strongly discouraged)
      - runSetup.py in IBF-pipeline (at least you can keep track here of what's uploaded)
    - when you're done developing on your local db + local code ..
    - .. and have deployed code to test-vm ..
    - .. you have to somehow make sure that the data also ends up on the dev-database `geonode_datav3`
      - repeat in the same way on test-vm (e.g. runSetup.py on there as well)
      - do a dump+restore from local to `geonode_datav3`
        - NOTE: coordinate with other developers though, that you are not working in separate branches and will overwrite each others' data
    - NOTE: for other servers no action needed: to get this to staging/production/etc. is taken care of by the database migration step in the deploy-script   
  - NOTE: that the other developers subsequently have to get the data also to their local database
    - which again requires a dump+restore
    - so notify them to do this

### Installation result

These commands will install the IBF-system with listeners at,

1. [localhost](http://localhost) for the web server
2. \*development only - [localhost:4200](http://localhost:4200) for the web
   interface

## Releases

See notable changes and the currently release version in the
[CHANGELOG](CHANGELOG.md).

### Release Checklist

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

## Adding a new country

For adding a new country to the IBF-system, a lot of components are already
generic, and thus automized. But also quit some manual steps are needed at the
moment. This is intended to be improved in the future. The list below is
intended to give a full overview. It is not however meant to be detailed enough
to execute each step, without further knowledge. Ask a developer who knows more.

### Adding country with disaster type *Floods*
1. IBF-API-Service
    - Users:
        - Add user for country to src/scripts/users.json
        - Add country to admin-user
    - Country
        - Add country in src/scripts/countries.json
    - Upload through 'npm run seed' from API-service
2. Data for database (look at existing countries and files for examples in terms of format)
    - Save admin-area-boundary file (.shp) for agreed upon admin-level as geojson (with extension .json) with the right column names in `services/API-service/src/scripts/git-lfs/`
    - Save Glofas_stations_locations_with_trigger_levels_<country_code>.csv in the same folder
    - Save Glofas_station_per_admin_area_<country_code>.csv in the same folder
        - which (e.g.) 'districts' are triggered if station X is triggered?
        - note: this should include all admin-areas. If not mapped to any
          station, use 'no_station'
    - Potentially add extra code in seed-scripts (seed-amin-area.ts / seed-glofas-station.ts / etc.) to process new data correctly.
    - Run seed script of IBF-API-service
    - NOTE: we are in a migration, where we want to move new data as much as possible to this new seed-script set up. So also for other data, not mentioned here, the goal is to upload this via seed-scripts as well. Some other data that is not yet included in seed-script
      - CRA data > transfered from "<country_code>\_datamodel"."Indicators_TOTAL_1" in CRA To
        "IBF-static-input"."<country_code>\_CRA_Indicators_1" using DBeaver export
        functionality
        - add necessary piece of script to CRA_data part of `processStaticDataPostgres.sql`
      - Flood vulnerability data to be used (.csv) > uploaded manually (through runSetup.py)
      - Red Cross branch data (.csv) > uploaded manually (through runSetup.py)
      - COVID risk data (.csv) > uploaded through specifically created endpoint
3. Geodata for IBF-pipline and IBF-geoserver (look at existing countries and files for examples in terms of format)
    - Save in `services/IBF-pipeline/pipeline/data` in the right subfolder ..
      - Flood extent raster (for at least 1 return period) + an 'empty' raster of
        the same exten/pixel size. (.tif)
      - Population (.tif)
      - Grassland + cropland (.tif)
      - The same admin-boundary-file as described above, but saves as .shp
    - When deploying to other environments (local/remote) this data needs to be transfered (e.g. as data.zip through WinSCP or similar)
4. IBF-pipeline
    - add country_code to .env (for development settings, replace by ONLY that code)
    - add country-specific settings to settings.py (e.g. right links to
      abovementioned data)
      - with model = 'glofas'
    - add country-specific settings to secrets.py
    - add dummy-trigger-station to glofasdata.py with forecast-value that exceeds trigger-value
    - Run runPipeline.py (`python3 runPipeline.py`) to test pipeline.
5. Geoserver
    - Manually create new stores+layers in [Geoserver interface of test-vm](https://ibf-test.510.global/geoserver/web)
        - flood_extent_<lead-time>\_<country_code> for each lead-time
        - population\_<country_code>
        - grassland\_<country_code>
        - cropland\_<country_code>
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
        - Paste in IBF-pipeline/pipeline/lib/notifications/logos/email-logo-<country_code>.png
        - Upload logo to mailchimp + retrieve shareable link + copy this in IBF-pipeline/pipeline/lib/notifications/formatInfo.py
    - Mailchimp segment
        - Add new tag '<country_code>' to at least 1 user
        - Create new segment '<country_code>' defined as users with tag
          '<country_code>'.
        - Get segmentId of new segment
        - Paste this in IBF-pipeline/pipeline/secrets.py
    - EAP-actions
        - Summarize actions from EAP-document + define 1 Area of Focus per
          EAP-action
        - Add to API-service/seed-data/EAP-actions.json
        - run 'npm run seed' from API-service

### Adding country with disaster type *Heavy rainfall*
- Follow the 'flood' manual above as much as possible, with notable exceptions
- Input data database
  - Rainfall_station_locations_with_trigger_levels.csv > currently not included in seed-script yet, but manually uploaded (through runSetup.py)
- Input dat pipeline
  - There is no equivalent input to the flood extent raster. This is created in the pipeline.
- Add country in IBF-pipeline settings.py with model = 'rainfall'
- Save geoserver output as rainfall_extent_<leadTime>_<countrYCode>


## Glossary

| Term          | Definition (_we_ use)                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `version`     | A 'number' specified in the [`SemVer`](https://semver.org/spec/v2.0.0.html)-format: `0.1.0`               |
| `tag`         | A specific commit or point-in-time on the git-timeline; named after a version, i.e. `v0.1.0`              |
| `release`     | A fixed 'state of the code-base', [published on GitHub](https://github.com/rodekruis/IBF-system/releases) |
| `deployment`  | An action performed to get (released) code running on an environment                                      |
| `environment` | A machine that can run code (with specified settings); i.e. a server or VM, or your local machine         |
