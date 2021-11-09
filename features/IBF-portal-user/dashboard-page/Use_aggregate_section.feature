@ibf-portal-user
Feature: View and use aggregate section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the Aggregate section

Scenario: Use aggregate section
    When user login into the IBF Dashboard
    Then the user see a column at middle of the dashboard
    And it contains total population, exposed population as per selected country and disaster
    And it contains the count of population and other events
    And it contains eye-buttons to get the inforation 
    And the user elasily get the count from here
    And it contais 'Action Summary' where use can see the events
    And take the action accoudingly

Scenario: Use chat section
    When the user clicks on eye-button
    Then the user gets the full information and use of that event
    And button cuttons the information as per selected country and Disaster
    And it also contains source link to get more detail inforation

