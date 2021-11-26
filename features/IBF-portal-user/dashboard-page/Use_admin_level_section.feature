@ibf-portal-user
Feature: View and use admin-level section

Background:
    Given a logged-in user on the dashboard page

Scenario: View admin-level section
    When the user enters the dashboard page
    Then the user sees the Admin-level section within the map at the top-left
    And it shows multiple "admin-level" buttons next to each other
    And the number and labels depend on the country
    And one or more of the buttons are enabled, these are the "active" admin-levels
    And they vary based on "country" and "disaster-type"
        - Levels 1,2,3,4 for Uganda
        - Levels 1,2,3 for Zambia
        - Level 3 for Ethiopia floods & malaria
        - Level 1 for Zimbabwe drought
        - Level 1 for Egypt heavy-rain
        - Level 2 for Philippines dengue
        - Level 3 for Philippines typhoon  
    And "inactive" admin-levels are in "disabled" mode
    And exactly one button is marked as "selected", this is the "default admin-level", and it can vary between "disaster-types" within the same country
        - Level 2 for Uganda
        - Level 2 for Zambia
        - Level 3 for Ethiopia floods & malaria
        - Level 1 for Zimbabwe drought
        - Level 1 for Egypt heavy-rain
        - Level 2 for Philippines dengue
        - Level 3 for Philippines typhoon  
    And the "selected" button is purple if TRIGGERED and navy-blue if NON-TRIGGERED

Scenario: Switch admin-level
    Given more than one "active" admin-levels
    When the user clicks a different admin-level
    Then the button switches to "selected" mode
    And the previous selected button switches to "unselected" mode
    And the rest of the dashboard updates to reflect the new admin-level
    And it should be noted that if a triggered area is selected in the map, this does not lead to any EAP-actions in the chat-section (move this to map-section)
    And if data for some layer is not available on the deeper selected admin-level, then it appears as 'no data' in the map 

Scenario: Unselect admin-level boundaries
    When the user clicks the current selected admin-level
    Then the button switches to "unselected" mode
    And now all buttons are "unselected"
    And the "admin-boundaries" in the map are now not visible any more.
    And this can be difficult to see sometimes, because the aggregate/fill layer itself is still visible, which also follows the admin-boundaries

    When the user clicks the admin-level again
    Then the button switches to "selected" mode again
    And the "admin-boundaries" in the map show again
