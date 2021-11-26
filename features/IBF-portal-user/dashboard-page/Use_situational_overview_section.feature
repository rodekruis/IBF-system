@ibf-portal-user
Feature: Use situational overview section

Background:
    Given a logged-in user on the dashboard page

Scenario: View the Situational overview section
    When the user enters the dashboard page
    Then the user sees the Situational overview section between the Header and the Chat section
    And it contains today's date, which is always the date of visiting the dashboard, not the last model run date
    And it contains the word 'TODAY'
    And it contains the word 'Situational Overview'

Scenario: View the Situational overview section in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When the user views the Situational overview section
    Then the background color is purple

Scenario: View the Situational overview section in NON-TRIGGERED mode
    Given the dashboard is in NON-TRIGGERED mode
    When the user views the Situational overview section
    Then the background color is navy-blue


