@ibf-portal-admin-user
Feature: Use timeline section

Background:
    Given a logged-in "admin" user on the dashboard page
    And is viewing the timeline section of the Dashboard

Scenario: View the timeline overview section
    When the user login to the IBF-dashboard
    Then user can see timeline section at the middle of dashboard below header
    And it contains 'date','month' and 'year' as per the lead time of disaster
    And contains timeline section with date buttons
    And it displays next trigger date to user for selected disaster
    And the buttons contains the date/month/hour/year as per selected disaster Type
    And the user can click on date/month/year buttons of any disaster

Scenario: View the button with different leadTime
    When the user click on the disaster type from chat section
    Then the timeline buttons shows the lead time as per selected disaster
    And it contains different lead time for different disasters
    And it provides upcoming trigger date of the selcted diasater
    And display it in timeline section
