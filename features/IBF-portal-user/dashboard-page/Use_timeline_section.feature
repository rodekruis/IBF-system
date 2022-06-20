@ibf-portal-user
Feature: View and Use timeline section

Background:
    Given a logged-in user on the dashboard page

Scenario: View the timeline section with 1 active lead-time in NON-TRIGGERED mode
    Given there is only one active lead-time
    When the user enters the dashboard page
    Then the user sees the Timeline section above the map section
    And it contains a row of "timeline" buttons
    And each button contains a mention of month, day and/or time depending on the disaster-type
    And it has one "enabled" and "selected" button, the only "active" lead-time and thus also the "selected" lead-time
    And it varies per country and disaster-type
        - '5-days' from now for Uganda floods
        - '7-days' from now for Zambia and Ethiopia floods
        - 'Next April' for Zimbabwe droughts (see specific scenario below)
        - 'Calculated time until landfall' for Philippines typhoon (see specific scenario below)
    And because "active" it is in "enabled" mode, slightly darker colored and clickable
    And because "selected" it is in "selected" mode, with dark outline and bold text

Scenario: View the timeline section with multiple active lead-times in NON-TRIGGERED mode
    Given there are multiple active lead-time (e.g. Heavy-rain/Dengue/Malaria)
    When the users views the timeline section
    Then it has multiple "enabled" buttons, these are the "active lead times"
    And they vary per country and disaster-type
        - '3-days', '5-days' and '7-days' from now for Egypt heavy-rain
        - '0-month', '1-month', '2-month' from now for dengue, malaria
    And it has exactly one "selected" button, the "selected lead time"
    And the "selected" lead-time is the most left / earliest of the "active lead times"

Scenario: View timeline-section for disaster-type "drought" without "sticky seasons"
    Given the disaster-type is "drought"
    Given the seasons are not "sticky" (i.e. Zimbabwe & Kenya)
    When the users views the timeline section
    Then it shows a button for every month from "next month" up to the "next forecast month" for which a drought is predicted (or not)
        - Kenya: Next March or next October
        - Zimbabwe: Next April
    And only the "next forecast month" is an "active" and thus the "selected" lead time
    And if the current month is 1 before the "next forecast month" only 1 button is shown (as "next month" = "next April")
    And if the current month is equal to "next forecast month" only 1 button is shown: "next forecast month" itself (an exception is made to show the current month)
    And if the current month is 1 month after the "next forecast month" then 11 buttons are shown

Scenario: View timeline-section for disaster-type "drought" with "sticky seasons"
    Given the disaster-type is "drought"
    Given the seasons are "sticky" (i.e. Ethiopia)
    When the users views the timeline section
    Then it shows all 12 month buttons, starting with the current month
    And if NON-TRIGGERED there can only be one active (and thus selected) lead-time
    And if TRIGGERED it can show multiple active lead times, but only if they are all TRIGGERED
    And the first active leadtime is selected
    And if multiple active leadtimes, this is mentioned in the chat-section

Scenario: View timeline-section for disaster-type "typhoon" with 1 event
    Given the disaster-type is "typhoon"
    When the users views the timeline section
    Then it shows one "active" and "selected" lead time
    And this is not a standard value, but is calculated in the pipeline as "time until landfall" (rounded to whole hours): e.g. "72 hours"
    And this leadtime is shown as "date and time" of landfall time 
    And additionally to the active button, a disabled button for each day before and after the day of landfall is placed, with a maximum of 7 days from now
    And these buttons are just to place the expected landfall in some visual context, and to create familiarity compared to other "disaster types"
    And the inactive leadtimes is shown only as "date", as "time" is not relevant for a day without landfall

Scenario: View timeline-section for disaster-type "typhoon" with 2 or more events
    Given the disaster-type is "typhoon"
    Given there are 2 more events (see 'API-admin-user/Upload_mock_data.feature' for instructions how to upload additional events)
    When the users views the timeline section
    Then it shows 2 or more "active" and "selected" lead time buttons
    And these are shown as "date and time" of landfall time for each event
    And if there are 2 active lead-times on the same day, then that means there will be 2 buttons for that day (including time)
    And additionally to the active buttons, a disabled button for each day before, in between, and after the days of landfall is placed, with a maximum of 7 days from now

Scenario: View timeline-section for disaster-type "typhoon" after landfall
    Given the disaster-type is "typhoon"
    Given the event has already made landfall
    When the users views the timeline section
    Then the calculated lead time of this event is 0 hours, and the time shown is thus the same time as the time in the 'today' button

Scenario: View timeline-section for disaster-type "typhoon" without landfall
    Given the disaster-type is "typhoon"
    Given the event will not make landfall
    When the users views the timeline section
    Then the calculated lead time of this event is not the 'time until landfall' (like normal typhoon events) but the 'time until point closest to landfall'
    
Scenario: View the timeline section in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When the users views the timeline section
    Then at least one of the "active lead time" buttons is purple instead of grey and it has a red outline
    And the "selected lead time" is automatically the triggered/purple lead-time and it has a thicker red outline then non-selected but triggered lead-times
    And if multiple it is the most left / earliest of the triggered lead-times
    And also "inactive"/"disabled" lead-times can be purple instead of grey, meaning that a trigger is detected for this lead-time, even though it is not clickable/examinable.
    And e.g. in the case of floods, this enables the user to follow day-by-day how far the flood is still away, even though the main actionable lead-time remains constant.

Scenario: Select different lead-time
    Given there are multiple active lead-time
    When the user clicks a different active lead-time
    Then that button switches to "selected" mode
    And the previous button switches to "unselected" mode
    And the rest of the dashboard - mainly the map - reflects the new selected lead-time
    And this contains for example different data for dynamic layers
    And if TRIGGERED the number of exposed admin-areas mentioned in the header of the "aggregates section" can vary
    And the values of the indicators in the "aggregates section" can vary
    And the "chat"/"area-of-focus"/"admin-level"/"layers" section do NOT change based on different lead-time
    And - if the different lead-times relate to different events (typhoon only) - then the event-button in the chat-section also switches to the event belonging to the new lead-time. 

Scenario: Select different leadtime in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When switching to an "untriggered" lead-time
    Then the general color mode of the dashboard remains triggered/purple
    And the header in the "aggregates section" mentions "0 exposed <admin-areas>" 



