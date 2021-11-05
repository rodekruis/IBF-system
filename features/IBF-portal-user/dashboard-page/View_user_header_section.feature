@ibf-portal-user
Feature: View and use header section
Background:
    Given any logged in user

Scenario: View header of dashboard page
    When the user looged-in into the IBF-portal
    Then the user redirected to IBF-dashboard
    And it shows "Logged in as" with login country's name 
    And it contains login country name (by using which country user looged in as)
    And it contains menu-icon, logo and "Logout"  and "Export View" buttons.
    And it contains that country's logo on the right side of the dashboard
    And it contains Logout and Export-view buttons 


Scenario: View logout page
    Given any logged in user
    When the user clicks the "Log Out" button in the header
    Then the user get logged out from IBF-portal

Scenario: View header in triggered mode
    Given any logged in user 
    When the user logged-in into triggered mode 
    Then 'Log-out' button display in puple color

Scenario: View header in Non-triggered mode
    Given any logged in user 
    When the user logged-in into non triggered mode 
    Then 'Log-out' button display in navy-blue color


Scenario: View Export view
    Given any logged in user
    When the user clicks the "Export View" button in the header
    Then the popup open with the message and shows a link to take screenshot
    And the user can follow the instructions provided 
    And can close the popup window if do not need to take screenshot

Scenario: View header in triggered mode
    Given any logged in user 
    When the user logged-in into triggered mode 
    Then 'Export View' button display in puple color

Scenario: View header in Non-triggered mode
    Given any logged in user 
    When the user logged-in into non triggered mode 
    Then 'Export View' button display in navy-blue color

Scenario: Log in unsuccessfully
    Given a successfully filled in login form
    When the user clicks "log in" 
    Then no feedback message is shown at the moment
    And 'email' and 'password' fields are emptied
    And 'log in' button is disabled again
    And the user cannot rediret to dashboard