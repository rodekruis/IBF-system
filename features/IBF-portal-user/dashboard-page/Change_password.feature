@ibf-portal-user
Feature: Change password

Background:
    Given a logged-in user on the dashboard page
    Given the user sees their username in the right end of the header
    Then the user clicks on the username
    And a popup opens with "Change Password" as title
    And the user sees two fields: "New Password" and "Confirm Password"
    And the "Change Password" button is disabled

Scenario: Filled in passwords match
    Then the user fills the first field with a valid password
    Then the user fills the second field with the same password
    And the "Change Password" button becomes enabled
    Then the user clicks on the "Change Password" button
    Then the popup closes
    And the "Password changed succesfully" toast appears on the bottom of the screen

Scenario: Filled in passwords don't match
    Then the user fills the first field with a valid password
    Then the user fills the second field with a different valid password
    And the "Change Password" button becomes enabled
    Then the user clicks on the "Change Password" button
    And the "Passwords do not match." message appears
