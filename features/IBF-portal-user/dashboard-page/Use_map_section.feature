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
        - 'Exposed population' for 'floods', 'drought' is NOT activated, as it is always 0 anyway
        - 'Houses affected' for 'typhoon' is NOT activated
        - 'Potential cases' for 'malaria' is activated, as even if no trigger it contains relevant data
        And it is visualized by 5 shades of grey in the map (as is any other selected shape-layer)
        And depending on disaster-type other point/rasterlayers are default activated (e.g. 'flood extent', 'Glofas stations') where applicable

# this is broken into different scenarios in trigger mode
    Scenario: View map in TRIGGERED mode
        Given the dashboard is in TRIGGERED mode
        When the users views the map
        Then it shows a selection of admin-areas dependent on disaster-type
        - For 'floods' only the triggered areas are shown
        - For 'malaria', 'drought' the whole country is shown
        - For 'typhoon' a custom selection is shown based on specific pipeline-input (practically this is somewhere in-between the above 2 options)
        And it shows by default the 'Alert threshold' layer as red outline
        And it shows as main exposure shape layer
        - 'Exposed population' for 'floods', 'drought'

        # Create tests for the following disaster-types
        # idea create a JSON for drought and floods that can be reused in the same test 
        - 'Exposed population' for 'drought'
        - 'Potential cases' for 'malaria'
        - 'Houses affected' for 'typhoon'

        And it is visualized by 5 shades of purple in the map (as is any other selected shape-layer)
        And it shows the legend relating to the default shape layer
        And depending on disaster-type other point/raster layers are default activated (e.g. 'flood extent', 'Glofas stations') where applicable

# add
    Scenario: View map in warning mode 
        Given a warning event
        When the users views the map
        Then it shows a selection of admin-areas in gradients of navy-blue instead of purple
        And the dashboard is in NON-TRIGGERED mode

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

# add
    Scenario: Zoom-in to a marker-cluster layer
        Given a "marker-cluster" layer is toggled on (e.g. "Health sites" or "Waterpoints")
        When the user zooms in either (through scrolling, through fingers or through the zoom-controls in the top-left of the map
        Then the circles with numbers start to break up in circles with smaller numbers
        And when you're zoomed in far enough you see the individual markers
        And these are clickable again just like normal point layers


