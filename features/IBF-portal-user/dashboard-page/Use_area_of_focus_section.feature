@ibf-portal-user
Feature: View and use area-of-focus section

Background:
    Given the user selects logged in to the IBF-Dashboard
    And is viewing the Area-of-focus section

Scenario: View area of focus section
    When the user login into the IBF Dashboard
    Then the user can see the section named as 'Action Summary' in the middle column of dashboard
    And it contains the information of all available events
    And it displays all the events for that country and disaster
    And the users can find the events selected by them