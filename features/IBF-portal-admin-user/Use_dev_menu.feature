@ibf-portal-admin-user
Feature: Use dev menu section

Background:
    Given a logged-in "admin" user on the dashboard page

Scenario: Open and view Dev Menu
    When the user clicks on menu-icon in the top left of Dashboard page
    Then the menu section open up
    And it contains a menu list
    And the menu list contains 'Version', 'Country', 'Load Mock Scenario', 'Activation Report'

Scenario: Click on Version
    When the user clicks "Version"
    Then a new tab opens on the IBF Github repository, specifically to the version tag

Scenario: Switch Country
    When the user clicks "country" dropdown of menu section
    Then the Country's dropdown section open up
    And it contains list of different countries with radio button
    And the user select any of the country from the list
    When the user selects a country
    Then the Dashboard page switches to that country

Scenario: View Load Mock Data popup
    When the user clicks on "Load Mock Scenario" from menu
    Then the 'Load Mock Scenario' popup open up
    And it generates a question whether the user wants to mock the situation for selected country
    And it contains 3 buttons "cancel", "No Trigger", "Trigger" buttons
    And it ask user to 'enter the secret' to switch to trigger/nontrigger mode 

Scenario: Load mock data successfully
    Given the user has opened the mock data popup
    And the user has filled in the correct secret
    And clicks "No Trigger" or "Trigger"
    Then the mock data is loaded in the back-end
    When the user refreshes and goes to the right country
    Then the new mock data should be visible in the dashboard
    
Scenario: Load mock data unsuccessfully
    Given the user has opened the mock data popup
    And the user has filled in an incorrect secret
    And clicks "No Trigger" or "Trigger"
    Then a message appears that says 'Failed to set mock scenario'

Scenario: View Activation Report
    When the user clicks on "Activation Report" from menu
    Then the 'activation-report' page opens up in a new tab
    And it contains 'disaster-activation-data' for all the countries
    And it contains 'country-code','disaster-type','placecode','name','startDate','endDate','closed','manualyClosed','exposureIndicator','exposureValue','databaseId'
    And it is in CSV-format, so that it can easily be copied to Excel

