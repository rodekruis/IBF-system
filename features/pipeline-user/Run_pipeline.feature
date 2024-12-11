@pipeline-user
Feature: Run pipeline

    Background:
        Given a script which has first successfully authenticated as user with 'admin' role
        Given disaster-type 'X' (floods | heavy-rain | drought | malaria | typhoon)

    Scenario: Successfully run pipeline
        Given all below scenarios that are applicable given disaster-type 'X' are successfully performed
        When the pipeline has finished running
        Then - if triggered - you receive an email if you are personally subscribed in mailchimp with the right tag (dependent on 'country' and 'production vs other')
        And the email is sent to the 'IBF Teams channel' if it is a production trigger
        And further details of the email are described in the specific scenario 'Successfully trigger email creation and sending'

        And the dashboard is updated when looking at it
        And the top speech bubble in the chat section mentions the new 'last model run timestamp'
        And the dashboard is in 'general triggered state' if triggered
        And it is in 'general non-triggered state' if not triggered
        And further details are specified in all detailed scenarios in 'IBF-portal-user/dashboard-page/'

    Scenario: Successfully upload exposure data
        Given any disaster-type
        When running this part of the script
        Then a success status code is returned
        And in the dashboard the exposure layers are visible with individual and aggregate values as expected

    Scenario: Successfully upload raster file
        Given disaster-type is 'floods' | 'heavy-rain'
        When running this part of the script
        Then a success status code is returned
        And in the dashboard the '<disaster-type> extent' is visible as expected

    Scenario: Successfully upload typhoon track data
        Given disaster-type is 'typhoon'
        When running this part of the script
        Then a success status code is returned
        And in the dashboard a track layer is visible as expected

    Scenario: Successfully upload Glofas station forecast data
        Given disaster-type is 'floods'
        When running this part of the script
        Then a success status code is returned
        And in the dashboard the Glofas station alert states and values are updated as expected

    Scenario: Successfully upload 'trigger per lead-time' data
        Given disaster-type is 'floods'
        When running this part of the script
        Then a success status code is returned
        And in the dashboard the timeline-buttons have colored/alert states as expected
        And this means that triggered lead-times are purple colored, even if they are non-active

    Scenario: Successfully trigger email creation and sending
        Given any disaster-type
        When running this part of the script
        Then a success status code is returned

        And on the server first a check is performed on 'triggered' state
        And it only continues with email creation + sending when triggered

        And the email has a subject with '<disaster-type Warning: Estimate of <exposure-variable>: <total exposure> (<lead-time>)

        And the email has a purple-colored header
        And it contains the country logo's
        And it contains a a title '<disaster-type> Trigger Notification'
        And it contains today's date
        And it contains a list of 'lead times' for which a trigger is activated

        And in the main text this general info is repeated
        And a button to go to the dashboard is included
        And it comes with direct links to video and/or PDF manuals if available (which is country-dependent)
        And a button with link to the EAP is included
        And a button to join a pre-made static WhatsApp/Telegram group is included

        And per triggered leadtime a list of triggered admin-areas is included
        And it contains per admin-area the predicted exposure
        And also the 'alert level' (currently only filled for 'floods')

        And at the bottom it contains a Trigger Statement

        And the email is automatically sent to all 'subscribed' users in 'Mailchimp' with the right tag
        And e.g. the tag 'Zambia' is used only on production-server 'ibf-zambia'
        And the corresponding tag 'Zambia test' is used on all other environments (local/test/staging) for testing purposes




