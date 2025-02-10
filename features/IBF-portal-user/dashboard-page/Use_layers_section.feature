@ibf-portal-user
Feature: View and use layers section ('matrix-component' in code)

    Background:
        Given a logged-in user on the dashboard page

    Scenario: View Layers section in collapsed state
        When the user enters the dashboard page
        Then the user sees the Layer-section within the map on the bottom right
        And it is in collapsed state
        And it mentions 'Layers' and has an arrow pointing up

    Scenario: Open Layers section
        When the user clicks the 'Layers' section
        Then it opens upwards
        And the arrow in the header now points down
        And it contains a list of all available layers
        And which layers depends on "country" and "disaster-type"
        And each indicator has a "checkbox" or "radio-button", a "label" and an "info-button"
        And "checkbox" means that multiple of those layers can be selected, and "radio-button" means at most one can be selected
        And some of the layers are "active" by default
        And this also depends on "triggered" or not
        And the "active" rows have the "checkbox"/"radiobutton" filled

    Scenario: View layers section in NON-TRIGGERED mode
        Given the dashboard is in NON-TRIGGERED mode
        When the users views the open layers section
        Then it does show the red outline 'Alert threshold' layer activated
        And depending on disaster-type a default exposure layer is activated
        - 'Exposed population' for 'floods' and 'drought' is NOT activated, as it is always 0 anyway
        - 'Houses affected' for 'typhoon' is NOT activated
        - 'Potential cases' for 'malaria' is activated, as even if no trigger it contains relevant data
        And depending on disaster-type other point/raster layers are default activated where applicable (for 'floods': 'glofas stations')

    Scenario: View layers section in TRIGGERED mode
        Given the dashboard is in TRIGGERED mode
        When the users views the open layers section
        Then it shows the red outline 'Alert threshold' layer activated
        And it shows as main exposure shape layer
        - 'Exposed population' for 'floods', 'drought'
        - 'Potential cases' for 'malaria'
        - 'Houses affected' for 'typhoon'
        And depending on disaster-type other point/raster layers are default activated where applicable (for 'flodos': 'glofas stations' AND 'flood extent')

    Scenario: Unselect selected "checkbox" layer
        When the user unselects a currently selected layer
        Then the layer switches to "unselected" mode
        And the data is no longer visible in the map
        And the legend for the layer in the map - if applicable - disappears

    Scenario: Select unselected "checkbox" layer
        When the user selects an unselected layer
        Then the layer switches to "selected" mode
        And the data becomes visible in the map
        And the layer is added to the legend

    Scenario: Select unselected "radio-button" layer
        When the user selects an unselected "radio-button" layer
        Then any currently selected "radio-button" layer becomes "unselected"
        And the admin-areas in the map is now coloured based on the new layer
        And the legend in the map is replaced by the new layer

    Scenario: Unselect selected "radio-button" layer
        When the user unselects the selected "radio-button" layer
        Then it toggles to unselected
        And it disappears from the legend
        And in the map the admin-areas are not coloured now as no layer is selected

    Scenario: Click info-button
        When the user clicks on an info-button
        Then a popup opens with description and source links of the layer
        And this information can sometimes be slightly different then the information for the same indicator in the "aggregates section"
        And it contains a close-button

    Scenario: Select point layer with no data
        Given a point layer with no data (e.g. 'community notifications')
        When the users selects a point layer with no data
        Then the row switches to "selected" mode
        And no data appears in the map, as it is not available.