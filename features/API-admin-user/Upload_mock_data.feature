@api-admin-user
Feature: Upload mock data

    Background:
        Given a logged-in user on the Swagger UI page

    Scenario: Upload mock data for all countries & disaster-types at once
        Given the user is using the `/api/scripts/mock` endpoint
        Given the user is leaving `countryCodeISO3` and `disasterType` empty
        Given the right `secret` (depends on environment)
        Given 'removeEvents=true' is filled in
        Given the user has filled in 'trigger' or 'no-trigger' for 'scenario'
        When the user clicks 'Execute'
        Then mock data is uploaded for all countries and all disaster-types
        And all are triggered if 'scenario=trigger' is chosen
        And all are non-triggered if 'scenario=no-trigger' is chosen
        And it includes data for all dynamic admin-area layers defined for that country & disaster-type
        And it includes data for dynamic point layers (e.g. Glofas stations' / 'Typhoon track')
        And it includes dynamic raster data ('flood extent' / 'rainfall extent')
        And the dashboard should be opened/refreshed to check all of this

    Scenario: Upload mock data for specific country and/or disaster-type
        Given the user is using the `/api/scripts/mock` endpoint
        Given `countryCodeISO3` and/or `disasterType` is filled in
        Given a known `scenario` is filled in
        When the user clicks 'Execute'
        Then mock data is uploaded for the chosen 'country', 'disaster-type' and 'scenario' if matching data is found for that combination
        And country/disaster-type combinations for which the provided 'scenario' is not present are skipped without error
        And all the data as described in previous scenario is uploaded









