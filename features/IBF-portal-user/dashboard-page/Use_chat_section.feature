@ibf-portal-user
Feature: View and use chat section

Background:
    Given a logged-in user on the dashboard page
    Given logged in for a specific "country"

Scenario: View chat section
    When the user enters the dashboard page
    Then the user sees the Chat section on the left of the page
    And it contains multiple "speech-bubbles" with information
    And the speech-bubbles have grey background in NON-TRIGGERED mode
    And the speech-bubbles have purple background in TRIGGERED mode
    And each speech-bubble has a timestamp (of now) in the bottomright corner
    And the 1st speech-bubble gives information on last model run (see below)
    And the 2nd speech-bubble gives general trigger information (see below)
    And if TRIGGERED or OLD-EVENT a 3rd speech-bubble gives further instructions

Scenario: View last model run information
    When the user views the 1st speech bubble
    Then it first says: "Hello <user>"
    And it mentions the date and time of the last model run update. 
    And it has red background if the last model run date is too long ago
    And the threshold for this is if it is more than 1 upload-interval + 10% ago (e.g. 1 day + 10% in case of floods)
    And it contains 4 buttons 'About Trigger' and 'Video Guide' and 'Activation Log' and 'Export View'

Scenario: Click 'About Trigger' 
    When the user clicks on "About Trigger" button
    Then a new tab opens with the EAP-document
    And if it is a Google Sheet it might scroll automatically to the specific 'trigger' section of the EAP
    And if it is a PDF this is not possible and it loads at the top.

Scenario: Click 'Video Guide'
    When the user clicks on 'Video Guide' button
    Then a popup opens where the video can be played

Scenario: Click 'Activation Log'
    When the user clicks on 'Activation Log' button
    Then the 'activation-log' page opens up in a new tab
    And it contains 'disaster-activation-data' for all the countries
    And it contains 'country-code','disaster-type','placecode','name','startDate','endDate','stopped','manuallyStopped','exposureIndicator','exposureValue','databaseId'
    And it is in a table
    And it can easily be copied to Excel

Scenario: Click 'Export view'
    When the user clicks the "Export View" button in the header
    Then the popup open with the message and shows a link to take screenshot
    And the user can follow the instructions provided 
    And can close the popup window if do not need to take screenshot

Scenario: View general trigger information
    When the user views the 2nd speech bubble
    Then if NON-TRIGGERED it mentions there are 'no triggers'
    And if TRIGGERED it mentions there is a trigger
    And it mentions when the event this trigger belongs to first started
    And it mentions for when the trigger is expected
    And it mentions the name of the event if applicable ('typhoon' only)
    And the exact UX copy differs between disaster-types (Potentially: document in more detail)

Scenario: View general trigger information with 2 or more active events
    Given the selected 'disaster-type' is 'typhoon' 
    Given there are 2 or more active events (see 'API-admin-user/Upload_mock_data.feature' for instructions how to upload additional events)
    When the user views the 2nd speech bubble
    Then it mentions a paragraph per event with event-details such as name, start-date, arrival-time.
    And it contains a button for each event
    And the first event/button is the selected event and has a 'selected styling'
    And the other buttons have a 'non-selected' styling
    And all info in the map by default refers to the 1st event
    And the timeline sections has just as many active timeline-buttons as there are events

Scenario: Switch event
    Given the selected 'disaster-type' is 'typhoon' 
    Given there are 2 or more active events (see 'API-admin-user/Upload_mock_data.feature' for instructions how to upload additional events)
    When the user clicks a non-selected event button
    Then that button switches to active state
    And the previously active button switches to inactive state
    And the selected timeline-button in the timeline-section also switches to the one related to the new event
    And all data in the dashboard switches to the new event

Scenario: View overview & further instructions
    Given the dashboard is in TRIGGERED state
    Given the selected "admin level" is the "default admin level"
    Given there are no areas for which the trigger is stopped
    When the user views the 3rd speech bubble
    Then it mentions an overview of the triggered areas, sorted by the "action unit" of that disaster type (e.g. "exposed population")
    And it mentions instructions that you can click an area in the map 
    And if done so, that you can perform additional actions per area.
    And no such speech bubble is available on other admin levels then the default admin level

Scenario: View overview & further instructions WITH "stopped" areas
    Given there are areas for which the trigger is stopped
    Given for the rest the same as scenario above
    Then the same applies as scenario above
    And additionally there is a separate 4th speech bubble which lists stopped areas
    And it is grey colorded (as "NON-TRIGGERED") with black border
    And it mentions the stopped areas in same order as scenario above
    And it mentions instructions that you can click a stopped area in the map

Scenario: View chat-section after area-selection in map of "non-stopped" area
    Given the area is not "stopped"
    When the user selects a triggered area from map (see 'Use_map_section.feature')
    Then the speech bubbles giving overview of active and stopped areas disappear
    And a new speech bubble appears in the chat section
    And it is pointed to the right instead of the left
    And it contains the "admin area" type and name 
    And it contains the relevant "action unit" type and value (e.g. "Exposed population" or "Potential cases")
    And it contains a list of all EAP-actions (same for every area) with "area of focus" name and "action" description
    And it shows which EAP-actions are already "checked" via the "checkbox"
    And it contains a disabled "save" button
    And it contains an enabled "close trigger/alert" button

Scenario: View chat-section after area-selection in map of "stopped" area
    Given the area is "stopped"
    When the user selects a triggered area from map (see 'Use_map_section.feature')
    Then the speech bubbles giving overview of active and stopped areas disappear
    And a new speech bubble appears in the chat section
    And it is grey colorded (as "NON-TRIGGERED") with black border
    And it mentions the start date of this trigger
    And the stop date
    And the user who stopped it

Scenario: View EAP-actions per area in OLD-EVENT mode
    Given the dashboard is in OLD-EVENT mode
    When the users views the chat section
    Then the additional actions per area automatically show for ALL triggered areas
    And the 'close trigger/alert' button is disabled

Scenario: Check or uncheck EAP-actions per triggered area
    Given the EAP-action speech-bubble is showing for one or more areas
    When the user checks or unchecks an EAP-action
    Then the 'save' button enables 

    When the user makes further changes that amount to the original selection
    Then the 'save' button disables again
    
    When the user clicks the 'save' button
    Then a popup appears that the database is updated
    And it closes again by clicking outside of it
    And (after refreshing) the Area-of-Focus summary will have updated (see 'Use_area_of_focus_section.feature')

Scenario: Stop trigger
    Given the dashboard is in TRIGGERED mode
    When the user clicks the 'close trigger/alert' button
    Then a popup appears that asks if you are sure
    And if confirmed the dashboard updates
    And the area will now show as grey with black border in the map
    And the lists of active vs stopped areas in the chat section will have updated
    And the event is now stopped with today's date in the database
    And as such reflected in the "activation report"