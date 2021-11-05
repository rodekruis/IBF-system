@ibf-portal-user
Feature: View menu section
Background:
    Given any logged-in user on menu-bar-section of header


Scenario: View Menu list
    When the user clicks on menu-icon of IBF-dashboard
    Then the menu section open up
    And it contains menu list
    And the menu list contains 'Version', 'Country', 'Load Mock Scenario', 'Activation Report'

Scenario: View Version section
    When the user clicks "View Version" of menu bar
    Then a new tab opens on the IBF Github repository, specifically to the version tag

Scenario: View Country section
    When the user clicks "country" dropdown of menu section
    Then the Country's dropdown section open up
    And it contains list of different countries with radio button
    And the user select any of the country from the list
    And the user can see all the attributes for selected country

Scenario: View Load Mock Scenario section
    When the user clicks on "Load Mock Scenario" from menu
    Then the 'Load Mock Scenario' popup open up
    And it generates a question whether the user wants to mock the situation for selected country
    And it contains 3 buttons "cancel", "No Trigger", "Trigger" buuttons
    And it ask user to 'enter the secret' to switch trigger/nontrigger mode 

Scenario: View Activation Report
    When the user clicks on "Activation Report" from menu
    Then the 'activation-report' section open up in new tab
    And it contains 'country-code','disaster-type','placecode','name','startDate','endDate','closed','manualyClosed','exposureIndicator','exposureValue','databaseId'
    And it contains 'disaster-activation-data' for all the countries
    And the user gets the activation data from this report

Scenario: Load menu unsuccessfully
    When the user clicks "log in" 
    Then no feedback message is shown at the moment
    And 'email' and 'password' fields are emptied
    And 'log in' button is disabled again
    And the user cannot rediret to dashboard
    And the user cannot see the menu bar with list