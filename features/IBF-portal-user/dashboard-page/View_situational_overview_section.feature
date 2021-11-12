@ibf-portal-admin-user
Feature: Use situational overview section

Background:
    Given a logged-in "admin" user on the dashboard page

Scenario: View the Situational overview section
    When the login to the dashboard
    Then user can see situational overview section below header
    And the user can see the all the disasters and it's data below situational overview
    And it contains Today's 'date','month' and 'year' on the left side of dashboard
    And contains timeline section with date buttons
    And it shows next trigger date for selected disaster
    And it shows the date/month as per selected disaster Type
    And the user can click on date/month of any disaster