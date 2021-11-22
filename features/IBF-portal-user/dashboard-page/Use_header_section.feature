@ibf-portal-user
Feature: View and use header section

Background:
    Given a logged-in user on the dashboard page

Scenario: View header of dashboard page
    When the user enters the dashboard page
    Then the user sees the Situational overview section at the top of the page
    And it shows "Logged in as" with the user's username 
    And it contains that country's logo on the right side of the dashboard
    And it contains a Logout and Export-view buttons 

Scenario: View header in Triggered mode
    When the user is viewing the Header section
    Then 'Log-out' button displays in purple color
    Then 'Export View' button displays in purple color

Scenario: View header in Non-triggered mode
    When the user is viewing the Header section
    Then 'Log-out' button displays in navy-blue color
    Then 'Export View' button displays in navy-blue color

Scenario: Logout
    When the user clicks the "Log Out" button in the header
    Then the user get logged out from IBF-portal
    And returns to the "login" page

Scenario: Export view
    When the user clicks the "Export View" button in the header
    Then the popup open with the message and shows a link to take screenshot
    And the user can follow the instructions provided 
    And can close the popup window if do not need to take screenshot





