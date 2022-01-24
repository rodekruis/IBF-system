# Contributing to IBF

:+1: Thank you for taking the time to contribute! Read our
[code of conduct](./CODE_OF_CONDUCT.md) before contributing.

## Got a Question or Problem?

[Post a question in the IBF Teams channel.](https://teams.microsoft.com/l/channel/19%3ab262590b1cc34ade9bbdb584f0765b31%40thread.skype/%255BRD%255D%2520Impact-based%2520forecasting?groupId=48e3c654-ac7d-4abc-9c70-ad637fb0a85f&tenantId=d3ab9790-6ae2-4bd8-aa5e-02864483e7c7)
Provide sufficient details and context so that others can understand and help.

## Found a Bug?

[Create a bug in the IBF backlog.](https://dev.azure.com/redcrossnl/IBF%20System/_backlogs/backlog)
Provide steps to reproduce, error messages and screenshots to help understand
the problem.

## Change Lifecycle

Any change goes through the following steps,

1. [Create backlog item](https://dev.azure.com/redcrossnl/IBF%20System/_backlogs/backlog)
2. Refine item requirements
3. Commit to sprint
4. [Create pull request with changes](https://github.com/rodekruis/IBF-system/compare)
5. Review changes
6. Merge pull request
7. Test for product stability
8. Publish to stage environments
9. Publish to production environments

We use [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) for
code change management.

## Code Style

We use [Prettier](https://prettier.io/) for TypeScript and JavaScript code.

We use [Black](https://github.com/psf/black) for Python code.

Code style is enforced by [pre-commit](../package.json#L44) and
[pre-push](../package.json#L45) git hooks and our
[GitHub Action workflow](../.github/workflows/workflow.yml).

## Commit Format

We use the [Conventional Commit](https://conventionalcommits.org/) format with
the following rules:

-   should start with a **prefix** to indicate the
    [type of change](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#type)
-   should have a **message** to briefly describe the change
-   should end with **task id(s)** to link to the sprint backlog

```text
// syntax
<prefix>: <commit_message> <devops_item_id>​​​​​​​
    |            |                |
    |            |                └──⫸ Azure DevOps item number. Format: AB#1234
    |            |
    |            └──⫸ Summary in present tense. Not capitalized. No period at the end.
    |
    └──⫸ build|ci|docs|feat|fix|perf|refactor|test

// examples
feat: added info-popups COVID-risk AB#1234
fix: changed login-function AB#2345
```

Prefix values `feat` and `fix` are reserved for new features and bug fixes.

Commits with `feat` or `fix` prefix will
[automatically](../.github/workflows/workflow.yml)

1. create a new version
2. update [CHANGELOG.md](../CHANGELOG.md)
3. release the new version to the test environment

## Create Pull Request

[Create a branch](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository)
from the [master](https://github.com/rodekruis/IBF-system/tree/master) branch.
The name of the branch should be concise and descriptive of the intended
changes.

```text
// syntax
<prefix>.<branch_name>
    |            |
    |            └──⫸ 2-4 keywords joined by underscore (_). Not capitalized.
    |
    └──⫸ build|ci|docs|feat|fix|perf|refactor|test

// examples
feat.covid_risk_popup_info
fix.login_function
```

The branch should be deleted after the pull request is merged.

## Code Review

We follow
[Google's Engineering Practices documentation](https://google.github.io/eng-practices/).
Provide proof of review in the form of screenshots or output messages.

## Datamodel migrations

When making changes to the datamodel of the API-service (creating/editing any *.entity.ts files), you need to create a migration script to take these changes into affect.


The process is 
1. Make the changes in the *.entity.ts file
2. Generate a migration-script with "docker-compose exec ibf-api-service npm run migration:generate <name-for-migration-script>"
3. Restart the ibf-api-service >> this will always run any new migration-scripts, so in this case the just generated migration-script
4. If more change required, then follow the above process as often as needed.
5. See also [TypeORM migration documentation](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)

NOTE: if you're making many datamodel changes at once, or are doing a lot of trial and error, you have another option.
1. In services/API-service/ormconfig.js set `synchronize` to `true` and restart ibf-api-service.
2. This will make sure that any changes you make to *.entity.ts files are automatically updated in your database tables, which allows for quicker development/testing.
3. When you're done with all your changes, you will need to revert all changes temporarily to be able to create a migration script. There are multiple ways to do this, for example by stashing all your changes, or working with a new branch. Either way:
    - stashing all your changes (git stash)
    - let ibf-api-service restart, so that datamodel changes are reverted as well again
    - set `synchronize` back to `false` and restart ibf-api-service
    - get your stashed changes again (git stash pop)
    - generate migration-script (see above)
    - restart ibf-api-service (like above, to run the new migration-script)

## Adding new data

- Any new static data needs to be imported using a seed-script + corresponding
  TypeORM entity
- This includes e.g. csv, json, geojson data
- The only exception are raster-files, which need to be included in data.zip [here](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/Gedeelde%20%20documenten/Forms/AllItems.aspx?id=%2Fsites%2F510%2DCRAVK%2D510%2FGedeelde%20%20documenten%2F%5BRD%5D%20Impact%2Dbased%20forecasting%2FGeneral%5FData%2FProduction%20Data&p=true&originalPath=aHR0cHM6Ly9yb2Rla3J1aXMuc2hhcmVwb2ludC5jb20vc2l0ZXMvNTEwLUNSQVZLLTUxMC9fbGF5b3V0cy8xNS9ndWVzdGFjY2Vzcy5hc3B4P2ZvbGRlcmlkPTBmYTQ1NGU2ZGMwMDI0ZGJkYmE3YTE3ODY1NWJkYzIxNiZhdXRoa2V5PUFjcWhNODVKSFpZOGNjNkg3QlRLZ08wJmV4cGlyYXRpb249MjAyMS0xMS0yOVQyMyUzYTAwJTNhMDAuMDAwWiZydGltZT1zekJQVnJfSjJFZw)
  and transfered to all relevant servers.

## Adding a new country (OLD - NEEDS UPDATE)

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

- Follow the 'flood' manual above as much as possible, with notable exceptions
- Input data database
  - Rainfall_station_locations_with_trigger_levels.csv > currently not
    included in seed-script yet, but manually uploaded (through runSetup.py)
- Input data pipeline
  - There is no equivalent input to the flood extent raster. This is created
    in the pipeline.
- Add country in IBF-pipeline settings.py with model = 'rainfall'
- Save geoserver output as rainfall*extent*<leadTime>\_<countrYCode>

## ! ! ! DO NOT ! ! !

1. DO NOT manually change the version number in `package.json`
2. DO NOT manually edit the [CHANGELOG.md](../CHANGELOG.md)
3. DO NOT edit any existing migration-scripts in migration-folder (./services/API-service/migration/)
