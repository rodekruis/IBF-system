@ibf-portal-user
Feature: View and use map section

Background:
    Given a logged-in user on the dashboard page

Scenario: View map section
    When the user enters the dashboard page
    Then the user sees the Map-section on the right of the page
    And it contains within it the "admin-level section" and the "layers section"
    And it contains zoom-buttons in the top-left
    And it contains attribution in the bottom-right
    And - if a shape layer is selected - it contains a legend in the bottom-left

Scenario: View map in NON-TRIGGERED mode
    Given the dashboard is in NON-TRIGGERED mode
    When the users views the map
    Then it shows all admin-areas for the entire country
    And depending on disaster-type a default exposure layer is activated
        - 'Exposed population' for 'floods', 'heavy rain', 'drought' is NOT activated, as it is always 0 anyway
        - 'Houses affected' for 'typhoon' is NOT activated
        - 'Potential cases' for 'dengue', 'malaria' is activated, as even if no trigger it contains relevant data
    And it is visualized by 5 shades of grey in the map (as is any other selected shape-layer)
    And depending on disaster-type other point/rasterlayers are default activated (e.g. 'flood extent', 'Glofas stations') where applicable

Scenario: View map in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When the users views the map
    Then it shows a selection of admin-areas dependent on disaster-type
        - For 'floods' and 'heavy-rain' only the triggered areas are shown
        - For 'dengue', 'malaria', 'drought' the whole country is shown
        - For 'typhoon' a custom selection is shown based on specific pipeline-input (practically this is somewhere in-between the above 2 options)
    And it shows by default the 'Alert threshold' layer as red outline
    And it shows as main exposure shape layer
        - 'Exposed population' for 'floods', 'heavy rain', 'drought'
        - 'Potential cases' for 'dengue', 'malaria'
        - 'Houses affected' for 'typhoon'
    And it is visualized by 5 shades of purple in the map (as is any other selected shape-layer)
    And it shows the legend relating to the default shape layer
    And depending on disaster-type other point/raster layers are default activated (e.g. 'flood extent', 'Glofas stations') where applicable

Scenario: View map in TRIGGERED mode with "stopped" areas
    Given there are "stopped" areas
    When the users views the map
    Then everything those as in the scenario above
    And "stopped" areas are grey instead of a shade of purple 
    And it has a black outline instead of a red outline for the "alert threshold" layer

Scenario: View legend
    Given a shape-layer is "selected" in the map
    When the users views the legend in the bottom-left of the map
    Then it shows the label of the currently selected shape layer
    And - if applicable - behind it in brackets the "unit" of this layer
    And it shows maximum 5 different shades of color with minimum-maximum values per color behind it
    And these are shades of purple if TRIGGERED and shades of grey if NON-TRIGGERED
    And the minimum/maximum values are calculated automatically by dividing the data into 5 equal-sized quintiles
    
    And if the layer has "custom color breaks" (e.g. UGA Flood vulnerability index) then the numbers are not calculated but default
    And additionally a text label per category is added

    And if the map contains admin-areas with 'no data' for this layer, then an additional 'no data' row is on top
    And it has a light-yellow color

Scenario: Click point-layer marker
    When the user clicks on the point-layer marker eg red-cross
    Then the user can a popup with name of the location and several attributes
    And the attributes are also shown if no data is available yet.
    And it contains different data for different point layer

Scenario: Click Glofas-station marker
    Given the "glofas station" layer is selected
    When the user clicks on a glofas station marker
    Then a more extensive popup appears
    And it contains a visualization of the forecast-level vs the trigger-level for that glofas-station

Scenario: Zoom-in to a marker-cluster layer
    Given a "marker-cluster" layer is toggled on (e.g. "Health sites" or "Waterpoints")
    When the user zooms in either (through scrolling, through fingers or through the zoom-controls in the top-left of the map
    Then the circles with numbers start to break up in circles with smaller numbers 
    And when you're zoomed in far enough you see the individual markers
    And these are clickable again just like normal point layers 

Scenario: Click admin-area in the map in NON-TRIGGERED mode
    Given the dashboard is in NON-TRIGGERED mode
    Given a "shape-layer" is selected
    When the user clicks on an admin-area
    Then a popup appears with the name of the admin-area, and the label and value of the selected "shape layer"
    And the "aggregates" section updates to "name" and "data" of the selected admin-area
    
    When the user clicks the same admin-area again
    Then the selection reverts 
    And this is the same effect as when clicking the appearing X in the header of the "aggregates section"


Scenario: Click admin-area in the map in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    Given a "shape-layer" is selected
    When the user clicks on a "non-triggered" admin-area
    Then the same happens as in above scenario

    When the user clicks on a "triggered" admin-area
    Then - in addition to the above - the chat-section updates (as described in 'Use_chat_section.feature')
    And the 'Area of focus' section filters to only the numbers specifically for that area 


Scenario: Click admin-area if trigger is on 'potential cases'
    Given the disaster-type is "dengue" or "malaria"
    And the "potential cases" layer is the current selected admin-level
    When the user clicks on an admin-area
    Then a more extensive popup appears
    Which looks similar to the Glofas-station popup
    And it contains a visualization of the forecast-level vs the trigger-level for that area


 