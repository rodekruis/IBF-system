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

Scenario: View timeline-section for disaster-type "drought"
    Given the disaster-type is "drought"
    When the users views the timeline section
    Then it shows a button for every month from "next month" up to "next April"
    And only "next April" is an "active" and thus the "selected" lead time
    And if the current month is "March" only 1 button is shown (as "next month" = "next April")
    And if the current month is "April" only 1 button is shown: "next April" (an exception is made to show the current month)
    And if the current month is "May" 11 buttons are shown: "June" up until "next April"

Scenario: View timeline-section for disaster-type "typhoon"
    Given the disaster-type is "typhoon"
    When the users views the timeline section
    Then it shows one "active" and "selected" lead time
    And this is not a standard value, but is calculated in the pipeline as "time until landfall" (rounded to whole hours): e.g. "55 hours"
    And in addition to this a disabled button for X-24, X-48, etc. is placed until reaching 0: so "31 hours", "7 hours"
    And the same for X+24, X+48, etc. until reaching 120: so "79 hours", "103" hours.
    And these buttons are just to place the expected landfall in some visual context, and to create familiarity compared to other "disaster types"

Scenario: View the timeline section in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When the users views the timeline section
    Then at least one of the "active lead time" buttons is purple instead of grey
    And the "selected lead time" is automatically the triggered/purple lead-time
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

Scenario: Select different leadtime in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When switching to an "untriggered" lead-time
    Then the general color mode of the dashboard remains triggered/purple
    And the header in the "aggregates section" mentions "0 exposed <admin-areas>" 



