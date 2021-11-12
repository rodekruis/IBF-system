@ibf-portal-user
Feature: View and use header section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the admin-levels on Dashboard page

Scenario: Use admin-level section
    When the user login into the IBF-dashboard
    Then the user can see different admin-levels as per selected country
    And it contains admin-level 1,2,3,4
    And it containd differnt admin-levels for different country
    And each admin-level is having different size of area and region
    And it displays that area on map after admin-level selection

Scenario: View admin_level section in map
    When the user selects admin-levels
    Then the user can check the seleced area within map
