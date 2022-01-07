@ibf-portal-user
Feature: View and use header section

Background:
    Given a logged-in user on the dashboard page
    Given logged in for a specific "country"

Scenario: View header of dashboard page
    When the user enters the dashboard page
    Then the user sees the Header section at the top of the page
    And it shows 'IBF PORTAL' followed by the "country" name, followed by the selected "disaster-type" name
    And it contains a Logout button 
    And it shows "Logged in as" with the user's username 
    And the username is underlined and clickable
    And it contains the logos of the "country"

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

Scenario: Open the "Change Pasword" form
    When the user clicks on the username
    Then a popup opens with "Change Password" as title
    And the user sees two fields: "New Password" and "Confirm Password"
    And the "Change Password" button is disabled
    And further scenarios on how to use the popup are in 'Change_password.feature'





