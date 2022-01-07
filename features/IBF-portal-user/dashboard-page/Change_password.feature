@ibf-portal-user
Feature: Change password

Background:
    Given a logged-in user on the dashboard page
    Given the user has opened the "change password" popup by clicking on its username in the "header section"

Scenario: User successfully changes the password
    When The user fills both fields with the same valid password
    Then the "Change Password" button becomes enabled
    When the user clicks on the "Change Password" button
    Then the popup closes
    And the "Password changed succesfully" toast appears on the bottom of the screen

Scenario: User fails to change the password
    When The user fills the fields with different passwords
    Then the "Change Password" button becomes enabled
    When the user clicks on the "Change Password" button
    Then the "Passwords do not match." message appears
