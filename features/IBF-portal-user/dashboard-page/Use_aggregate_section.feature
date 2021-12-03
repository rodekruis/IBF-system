@ibf-portal-user
Feature: View and use aggregate section

Background:
    Given a logged-in user on the dashboard page

Scenario: View aggregate section 
    When the user enters the dashboard page
    Then the user sees the Aggregate section at the top of the middle column
    And it has a header which mentions the current selection
    And it has a list of exposure indicators 
    And each indicator has an "icon", a "label", a "value" and an "info-button"
    And the list might be split in two groups
    And the indicators above are the "main" exposure variable (and 'total population')
    And the indicators below are more detailed exposured variables
    And the indicators differ per country and disaster-type.

Scenario: Click info-button
    When the user clicks on info-button
    Then a popup opens with additional info and source links on that indicator
    And this information can sometimes be slightly different then the information for the same indicator in the "layers section"
    And it contains a close-button 

Scenario: View aggregate section in NON-TRIGGERED mode
    Given the dashboard is in NON-TRIGGERED mode
    When the user enters views the aggregate section
    Then it has grey background
    And the top header mentions 'All <country-name>' and it has slightly darker grey background
    And the value here always refers to the whole country (e.g. the "total population" is the whole countries population)

Scenario: View aggregate section in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When the user enters views the aggregate section
    And it has light-purple background
    And the top header mentions 'X Exposed <admin-areas>' which has a slightly darker purple background
    And the value here always refers to the total of all areas that are shown in the map
    And if e.g. only triggered areas are shown this means that e.g. "total population" refers to the total population in the triggered areas)

Scenario: View aggregate section after area-selection in map
    When the user selects a triggered area from map (see 'Use_map_section.feature')
    Then the "values" in the aggregate section update
    And they refer now to only the selected area
    And the top header updates to the name of the selected area
    And an X appears in the right of the top header, which - if clicked - reverts the area-selection
    And this is the same effect as clicking the selected admin-area in the map a 2nd time


