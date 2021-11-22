@ibf-portal-user
Feature: View and use layers section ('matrix-component' in code)

Background:
    Given a logged-in user on the dashboard page

Scenario: View Layers section in collapsed state
    When the user enters the dashboard page
    Then the user sees the Layer-section within the map on the right
    And it is in collapsed state
    And it mentions 'Layers' and has an arrow pointing left
    And it is purple if TRIGGERED and navy-blue if NON-TRIGGERED

Scenario: Open Layers section
    When the user clicks the 'Layers' section
    Then it opens downwards
    And the arrow in the header now points right
    And it contains a list of all available layers
    And which layers depends on "country", "disaster-type", "triggered-state" (to do: more detail)
    And each indicator has a "label", a "legend" and an "info-button"
    And some of the layers are "active" by default
    And this also depends on "triggered-state"
    And the "active" rows are purple if TRIGGERED and navy-blue if NON-TRIGGERED
    And the "active" rows have the "legend box" filled
    And if a "point layer" it contains a "marker-icon" (the same as in the map. If the map contains multiple versions of this icon, here only one is shown)
    And if a "raster" layer then a square with the color of the raster-layer in the map (e.g. "red" for "flood extent")
    And if a "shape" layer then "grey" (TO DO: should this update after we changed map-colors to purple?)
    And if an "outline" layer ("Alert threshold") then grey with a red outline


Scenario: View layers section in NON-TRIGGERED mode
    Given the dashboard is in NON-TRIGGERED mode
    When the users views the open layers section
    Then it does not show the red outline 'Alert threshold' layer 
    And depending on disaster-type a default exposure layer is activated
        - 'Exposed population' for 'floods', 'heavy rain', 'drought' is NOT activated, as it is always 0 anyway
        - 'Houses affected' for 'typhoon' is NOT activated
        - 'Potential cases' for 'dengue', 'malaria' is activated, as even if no trigger it contains relevant data
    And depending on disaster-type other point/raster layers are default activated (e.g. 'flood extent', 'Glofas stations') where applicable
        - For 'floods': 'glofas stations'
        - For 'heavy-rain': 'rainfall extent'

Scenario: View layers section in TRIGGERED mode
    Given the dashboard is in TRIGGERED mode
    When the users views the open layers section
    Then it shows the red outline 'Alert threshold' layer for 'dengue', 'malaria', 'drought', 'typhoon'
    And it shows as main exposure shape layer
        - 'Exposed population' for 'floods', 'heavy rain', 'drought'
        - 'Potential cases' for 'dengue', 'malaria'
        - 'Houses affected' for 'typhoon' 
    And depending on disaster-type other point/raster layers are default activated (e.g. 'flood extent', 'Glofas stations') where applicable
        - For 'floods': 'glofas stations' AND 'flood extent'
        - For 'heavy-rain': 'rainfall extent'

Scenario: Unselect selected layer
    When the user unselects a currently selected layer
    Then the layer switches to "unselected" mode
    And the data is no longer visible in the map
    And the legend for the layer in the map - if applicable - disappears

Scenario: Unselect 'Alert threshold' layer
    When the user unselects the 'Alert threshold' layer
    Then nothing happens as this is not possible
    And the red outline always stays visible in the map
 
Scenario: Select unselected layer
    When the user selects an unselected layer
    Then the layer switches to "selected" mode
    And the data becomes visible in the map

Scenario: Select unselected "shape" layer
    When the user selects an unselected "shape" layer
    Then a legend appears in the bottom-left of the map, if a "shape" 
    And - in addition to the above scenario - any currently selected "shape" layer becomes "unselected"
    And switches to "unselected mode"
    And the data in the map is replaced by the new layer
    And the legend in the map is replaced by the new layer
    And this becomes you can visualize at most one shape-layer at a time, while raster/point-layers can be overlaid on each other infinitely
    

Scenario: Click info-button
    When the user clicks on an info-button
    Then a popup opens with description and source links of the layer
    And this information can sometimes be slightly different then the information for the same indicator in the "aggregates section"
    And it contains a close-button 

Scenario: Select point layer with no data
    When the users selects a point layer with no data
    Then the row switches to "selected" mode
    And no data appears in the map, as it is not available.
    And the layer is still included to stimulate end-user to provide data (example: Red Cross branches for some clarity)