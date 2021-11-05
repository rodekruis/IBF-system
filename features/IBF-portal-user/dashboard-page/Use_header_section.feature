@ibf-portal-user
Feature: View and use header section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the Dashboard page

Scenario: View header of dashboard page
    When the user is viewing the Dashboard page
    Then it shows "Logged in as" with the user's username 
    And it contains that country's logo on the right side of the dashboard
    And it contains a Logout and Export-view buttons 

Scenario: View header in Triggered mode
    Given any logged in user 
    When the user logged-in into triggered mode 
    Then 'Log-out' button display in purple color
    Then 'Export View' button display in purple color

Scenario: View header in Non-triggered mode
    Given any logged in user 
    When the user logged-in into triggered mode 
    Then 'Log-out' button display in navy-blue color
    Then 'Export View' button display in navy-blue color

Scenario: Logout
    When the user clicks the "Log Out" button in the header
    Then the user get logged out from IBF-portal
    And returns to the "login" page

Scenario: View Export view
    Given any logged in user
    When the user clicks the "Export View" button in the header
    Then the popup open with the message and shows a link to take screenshot
    And the user can follow the instructions provided 
    And can close the popup window if do not need to take screenshot





