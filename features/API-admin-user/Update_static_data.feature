@api-admin-user
Feature: Update static data

Background:
    Given a logged-in user on the Swagger UI page

Scenario: Upload and overwrite static admin-area data via CSV
    Given there is new/updated static admin-area (so: per placeCode) data (e.g. 'flood_vulnerability')
    Given the user is using the `/api/admin-area-data/upload/csv` endpoint
    Given the user has selected a CSV file
    Given the file is of the right format, having the columns 'countryCodeISO3', 'adminLevel', 'placeCode', 'indicator', 'value'
        > see 'services/API-service/src/scripts/git-lfs/admin-area-data/' for examples
    When the user clicks 'Execute'
    Then this data is uploaded
    And it overwrites any existing 'placeCode'-'indicator' combinations, if present

Scenario: Upload and overwrite static admin-area data via JSON
    Given there is new/updated static admin-area (so: per placeCode) data (e.g. 'flood_vulnerability')
    Given the user is using the `/api/admin-area-data/upload/json` endpoint
    Given the user has filled in the 'request body' in the provided format
    When the user clicks 'Execute'
    Then this data is uploaded
    And it overwrites any existing 'placeCode'-'indicator' combinations, if present

Scenario: Upload and overwrite point data via CSV
    Given there is new/updated point data on 'Redcross branches', 'Health sites' or 'Dam sites'
        > 'Glofas stations' are not updateable as they are too closely related to the floods-pipeline can cannot simply be replaced
    Given the user is using the respective `/api/<point-data>/upload/csv` endpoint
    Given the user has filled in a countryCodeISO3 as parameter
    Given the user has selected a CSV file
    Given the file is of the right format, having the columns
        - Redcross branches: lat,lon,branchName,numberOfVolunteers,contactPerson,contactNumber,contactAddress
        - Health sites: lat,lon,name,type
        - Dam sites: lat,lon,damName,fullSupplyCapacity
        > see 'services/API-service/src/scripts/git-lfs/<point-data-folder>/' for examples
    When the user clicks 'Execute'
    Then this data is uploaded 
    And it overwrites any existing entries for the provided country

Scenario: Upload/overwrite EAP-actions data
    Given there are new/edited EAP-actions
    Given the user is using the POST `/api/eap-actions` endpoint
    Given the user has filled in for 'eap-actions' attribute an array with one or more EAP-actions in the appropriate format, including 
        - 'countryCodeISO3', 'disasterType', 'action', 'label' as strings
        - 'areaOfFocus' in the format `{"id": "drr"}`
        - optionally 'month' as number
    When the user clics 'Execute'
    Then this data uploaded
    And it overwrites any known combinations of 'countryCodeISO3', 'disasterType' and 'action'
    And creates new entries for unknown combinations

Scenario: Upload/overwrite admin-area boundary data
    >> NOT YET POSSIBLE

Scenario: Upload/overwrite static raster data
    >> NOT YET POSSIBLE

Scenario: Upload/overwrite layer/indicator attributes
    >> NOT YET POSSIBLE



