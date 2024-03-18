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

    Scenario: Upload Typhoon-specific events
        Given the disaster-type is 'Typhoon'
        Given the user uses the '/api/scripts/mock-typhoon-scenario' endpoint
        Given the user fills in one of the available 'scenario' options
        Given the user fills in 'eventNr = 1'
        When the user clicks 'Execute'
        Then the mock data is uploaded for the given 'scenario'
    - eventTrigger: exact same result as using '/api/scripts/mock-dynamic-data' endpoint with 'triggered = true'
    - noEvent: exact same result as using '/api/scripts/mock-dynamic-data' endpoint with 'triggered = false'
    - eventNoTrigger: produces event that does not reach trigger threshold
    - eventAfterLandfall: produces (triggered) event that has already made landfall (i.e. leadTime = '0-hour')
    - eventNoLandafall: produces (triggered) event with a track that does not make landfall

    Scenario: Upload 2nd/3rd/etc. Typhoon event
        Given the disaster-type is 'Typhoon'
        Given user has already created an event (see above)
        Given the user is subsquently using the `/api/scripts/mock-typhoon-scenario`
        Given the user fills in 'eventNr' as 2/3/etc
        When the user clicks 'Execute'
        Then mock data is uploaded for a 2nd/3rd/etc event
        And the dashboard should be opened/refreshed to check all of this
        And the chat-section should show 2/3/etc event buttons in the 2nd speech-bubble
        And the timeline-section should show 2/3/etc active lead-time buttons




