@ibf-portal-admin-user
Feature: Use dev menu section

Background:
    Given a logged-in "admin" user on the dashboard page

Scenario: View the Situational overview section
    When the login to the dashboard
    Then user can see situational overview section below header
    And it contains Today's 'date','month' and 'year'
    And contains timeline section with date buttons
    And it shows next trigger date for selected disaster
    And it shows the date/month as per selected disaster Type
    And the user can click on date/month of any disaster