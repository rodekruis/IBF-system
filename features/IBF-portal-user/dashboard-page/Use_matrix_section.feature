@ibf-portal-user
Feature: View and use matrix/layer section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the matrix section

Scenario: View Layers of Matrix section
    When the user loggedin to IBF Dashboard page
    Then the user can see "Layers" section at the right side of th dashboard
    And it contains all the data for that country and for selected disaster
    And it contains data for different types of layer
    And user can select view the default slected layer for that country
    And by selecting the layer user can see the area affected for selected country(within map)with it's count

Scenario: Toggle the layers of dashboard page
    When the user Toggle the layers
    Then the user can see the affected area on map
    And the user see markers within map (as per selected laer)
    And it contains information of all the affected area and count of population
    And the user can easily diffentiate layers
    And it contains different markers, color and the way of visualization
    And it contains layer as per country and disaster type
    And it also contains the information in the eye-buttons allocated with layer(Layer information)

Scenario: View layer info buttons of matrix section
    When the user clicks on the eye-buttons of layers
    Then the ueer can read the information about the layer
    And it gives the information with present/last year data which consist with particular disaster 
    And it contains the source link to get the more details






