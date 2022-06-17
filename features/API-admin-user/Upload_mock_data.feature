@api-admin-user
Feature: Upload mock data

Background:
    Given a logged-in user on the Swagger UI page

Scenario: Upload mock data for all countries & disaster-types at once
    Given the user is using the `/api/scripts/mock-all` endpoint
    Given the user has filled in the right `secret` (depends on server/environment)
    Given the user has filled in 'true' or 'false' for 'triggered'
    When the user clicks 'Execute'
    Then mock data is uploaded for all countries and all disaster-types
    And all are triggered if 'triggered=true' is chosen
    And all are non-triggered if 'triggered=false' is chosen
    And it includes data for all dynamic admin-area layers defined for that country & disaster-type
    And it includes data for dynamic point layers ('Glofas stations' / 'Typhoon track')
    And it includes dynamic raster data ('flood extent' / 'rainfall extent') 
    And only 1 event is uploaded per country and disaster-type (relevant for `typhoon` only)
    And the dashboard should be opened/refreshed to check all of this

Scenario: Upload mock data for TRIGGERED state (active event) for specific country & disaster-types
    Given the user is using the `/api/scripts/mock-dynamic-data` endpoint
    Given the user has filled in the right `secret` (depends on server/environment)
    Given the user has filled in 'triggered = true'
    Given the user has filled in 'removeEvents = true'
    Given the user has filled in 'country' and 'disaster-type' (exact right formats)
    Given the user has filled in 'eventNr = 1' 
    When the user clicks 'Execute'
    Then mock data is uploaded for the chosen 'country' and 'disaster-type'
    And it is in triggered state
    And all the data as described in previous scenario is uploaded
    And the dashboard should be opened/refreshed to check all of this

Scenario: Upload mock data for NON-TRIGGERED state (no event) for specific country & disaster-types
    Given everything the same as previous scenario
    Given the user has filled in 'triggered = false'
    When the user clicks 'Execute'
    Then mock data is uploaded for the chosen 'country' and 'disaster-type'
    And it is in non-triggered state
    And all the data as described in previous scenario is uploaded
    And the dashboard should be opened/refreshed to check all of this

Scenario: Upload mock data for OLD-EVENT state for specific country & disaster-types
    Given user has first created an active event (see scenario TRIGGERE state)
    Given the user is subsquently using the `/api/scripts/mock-dynamic-data` endpoint a 2nd time
    Given the user changes 'triggered' to 'false' 
    Given the user changes 'removeEvents' to 'false'
    Given the user leaves all other input the same
    When the user clicks 'Execute'
    Then mock data is uploaded for the chosen 'country' and 'disaster-type'
    And it is updating the existing event to become inactive, and thus an 'old event'
    And the dashboard should be opened/refreshed to check all of this 
    And the dashboard is in NON-TRIGGERED state
    And the map is showing no triggered areas
    And the chat section is showing EAP-actions for all old triggered areas
    And see other feature files to look for correct behaviour of old event, by Ctrl+F on 'OLD-EVENT'

Scenario: Upload 2nd/3rd/etc. Typhoon event
    Given the disaster-type is 'Typhoon'
    Given user has already created an active event (see scenario TRIGGERED state)
    Given the user is subsquently using the `/api/scripts/mock-dynamic-data` endpoint a 2nd time
    Given the user changes 'eventNr' to 2/3/etc
    Given the user selects one scenario between ('eventTrigger', 'eventNoTrigger', 'eventAfterLandfall')
    Given the user leaves all other input the same
    When the user clicks 'Execute'
    Then mock data is uploaded for a 2nd/3rd/etc active event
    And the dashboard should be opened/refreshed to check all of this 
    And the chat-section should show 2/3/etc event buttons in the 2nd speech-bubble
    And the timeline-section should show 2/3/etc active lead-time buttons

Scenario: Upload 2nd event for other disaster-type
    Given the disaster-type is NOT 'Typhoon'
    Given the user is using the `/api/scripts/mock-dynamic-data` endpoint
    Given user fills in eventNr = 2 or more
    When the user clicks 'Execute'
    Then eventNr is automatically switched back to 1 in the back-endpoint
    And processes correctly given that input



