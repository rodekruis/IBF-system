@ibf-portal-user
Feature: View and use header section

Background:
    Given the user logged-in into the IBF-portal
    And is viewing the map on IBf-Dashboard page

Scenario: View map
    When the user logged-in into the IBF-dashboard
    Then user see the map on dashboard
    And it contains the marker, admin areas, affected regions by one disaster
    And it also displays the selected layers impact 

Scenario: Click admin-areas of dashboard page
    When the user clicks on the admin-areas
    Then the user can see the triggered data with lead time
    And it also displays activation threshold

Scenario: Click on point-layer markers
    When the user clicks on the point-layer marker eg red-cross
    Then the user can see the 'No. of volunteers', 'Contact person', 'address', 'number'
    And it contains different data for different point layer

Scenario: Zoom-in and zoom-out on map to a marker-cluster layer
    When the user logged-in to the dashboard and see the map
    Then user finds 2 buttons '+' and '-'
    And user use '+' for zoom-in into the map
    And use '-' button to zoom-out from map
    And user can also use zoom-in and zoom-out without buttons by scrolling or using fingure-tips 

Scenario: View zoom-in with cluster layer
    When the user selects the cluster layer from matrix section
    Then the user sees the area with circle 
    And the user can see many markers in a circle with it's count
    And user find same or different markers as per the type eg. health and waterpoint
    And once the user zoom-in more and more the marker count gets decreased
    And user can find the marker with for zoomed-in location
 
Scenario: Toggle matrix section
    When the user logged-in into the dashboard
    Then once the user toggel the matrix section the map changes accordingly
    And the map displays laers as per user's layer selection
    And it displays the pointer, cluster, different color, shapes on the map as per selected layer
