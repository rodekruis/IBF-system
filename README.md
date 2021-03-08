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

`cp .env services/API-service/.env` `npn run start`

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
    stage VM before merging the PR.
-   When a [release](#release-checklist) is published, it is automatically
    deployed to the staging-server.

### To "production" environment

-   Make sure to verify if the environment-settings are appropriately set on the
    VM before merging the PR.
-   When a [release](#release-checklist) is published, it is automatically
    deployed to the staging-server.

## Adding a new country

For adding a new country to the IBF-system, a lot of components are already
generic, and thus automized. But also quit some manual steps are needed at the
moment. This is intended to be improved in the future. The list below is
intended to give a full overview. It is not however meant to be detailed enough
to execute each step, without further knowledge.

1. Prepare data (look at existing countries for exact format examples +
   locations where to store)
    - Flood extent raster (for at least 1 return period) + an 'empty' raster of
      the same exten/pixel size. (.tif)
    - Population (.tif)
    - Grassland + cropland (.tif)
    - Admin-area-boundary file for agreed upon admin-level (.shp)
    - Glofas*stations_locations_with_trigger_levels*<country_code>.csv
    - Glofas*station_per_admin_area*<country_code>.csv
        - which (e.g.) 'districts' are triggered if station X is triggered?
        - note: this should include all admin-areas. If not mapped to any
          station, use 'no_station'
    - vulnerability data to be used (.csv)
2. Database + scripts
    - Transfer "<country_code>\_datamodel"."Indicators_TOTAL_1" from CRA To
      "IBF-static-input"."<country_code>\_CRA_Indicators_1" using DBeaver export
      functionality
    - Transfer "<country_code>\_datamodel"."Geo_level1" from CRA to
      "IBF-static-input"."<country_code>\_Geo_level1" using DBeaver export
      functionality
    - add necessary piece of script to `processStaticDataPostgres.sql`
        - dashboard_glofas_stations
        - waterstation_per_district
        - metadata
    - add necessary piece of script to `IBF-database-scripts.sql` (for now this
      allows only 1 admin-level + pretend all countries are same admin-level)
        - CRA_Data_2
        - Admin_area_data_2
3. IBF-pipeline
    - add country_code to settings.py
    - add country-specific settings to settings.py (e.g. right links to
      abovementioned data)
    - Run runSetup.py (`python3 runSetup.py`) for new country only (comment out
      other countries in settings.py)
    - Run runCron.py (`python3 runCron.py`) to test pipeline.
4. Api-Service
    - Users:
        - Add user for country to src/scripts/users.json
        - Add country to admin-user
    - Country
        - Add country in src/scripts/countries.json
    - Upload through 'npm run seed' from API-service
5. IBF-dashboard
    - Add country + parameters to country.service.ts
    - Test dashboard by logging in through admin-user or country-specific user
6. Geoserver
    - Manually create new layers in Geoserver interface (do this on server only,
      not locally)
        - flood*extent*<lead-time>\_<country_code> for each lead-time
        - population\_<country_code>
        - grassland\_<country_code>
        - cropland\_<country_code>
    - Test that the specifics layers are viewable in the dashboard now
    - When done, commit the (automatically) generated content in
      IBF-pipeline/geoserver-workspaces to Github
    - This will prevent you from having to do the same for another server, or if
      your content is lost somehow
7. Specifics/Extras
    - Whatsapp:
        - create whatsapp group
        - paste link in IBF-pipeline/pipeline/lib/notifications/formatInfo.py
    - EAP-link
        - create bookmark in Google Docs at place where Trigger Model section
          starts
        - paste link (incl bookmark) in
          IBF-dashboard/src/app/services/country.service.ts
        - paste link (excl bookmark) in
          IBF-pipeline/pipeline/lib/notifications/formatInfo.py
    - Logo's
        - Get logo(s) (.png)
        - Paste in IBF-dashboard/app/assets/logos + add reference to each logo
          in IBF-dashboard/src/app/components/logos/logos.component.ts
        - Paste in IBF-pipeline/pipeline/email-logo-<country_code>.png
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

## Glossary

| Term          | Definition (_we_ use)                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `version`     | A 'number' specified in the [`SemVer`](https://semver.org/spec/v2.0.0.html)-format: `0.1.0`               |
| `tag`         | A specific commit or point-in-time on the git-timeline; named after a version, i.e. `v0.1.0`              |
| `release`     | A fixed 'state of the code-base', [published on GitHub](https://github.com/rodekruis/IBF-system/releases) |
| `deployment`  | An action performed to get (released) code running on an environment                                      |
| `environment` | A machine that can run code (with specified settings); i.e. a server or VM, or your local machine         |
