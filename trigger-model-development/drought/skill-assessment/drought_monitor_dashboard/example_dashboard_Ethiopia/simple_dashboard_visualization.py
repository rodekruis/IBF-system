'''
Simple, bare-bones, version of a drought monitoring dashboard


(Misha + Diewertje)


Uses dataset generated from the "update_dashboard_data.py" as input 
'''
import dash 
import dash_core_components as dcc 
import dash_html_components as html 
import h5py
import os
import sys

# -- DATA FILE ---
#TODO: You could allow the user to select the admin level using a dropdown or such.
# Allowing for selecting the country could in principle work, but would require to load in a different dataset
# We assumed that end-users would be of a particular country.
PathToFile= '../processed_data/'
baseName = 'eth_meteorological_drought_indicators.hdf5'
fileName = os.path.join(PathToFile, baseName)


# --- wrote app components in separate files to make this file more easy to read ---
from app_components import graph_time_series as graphTIME
from app_components import graph_barchart_regions as graphBAR
from app_components import selection_components as usrIO
indicators_all = usrIO.get_available_indicators(fileName)
dates_all, regions_all = usrIO.get_available_regions_dates(fileName, indicators_all[0])
# TODO: available dates could be different for different indicators



# --- defining app-components: Assign variables and the id for every component ---
GraphTimeSeries = dcc.Graph(id='graph-indicator-vs-time')
GraphBarChart = dcc.Graph(id='graph-indicator-vs-region')
TriggerSelector = usrIO.slider_trigger_lvl(id='trigger-level-selection')
IndicatorSelector = usrIO.create_dropdown(key_list=indicators_all[::-1], id='indicator-selection')
RegionSelector = usrIO.create_dropdown(key_list=regions_all, id='region-selection')
DateSelector = usrIO.create_dropdown(key_list=dates_all, id='date-selection')
#TODO: You could allow the user to select the admin level using a dropdown or such.
# Allowing for selecting the country could in principle work, but would require to load in a different dataset
# We assumed that end-users would be of a particular country.






# --- build the app --- 
app = dash.Dash()
app.layout= html.Div([

    # -- Dump all the user selections on top ---
    html.Div(children=[
        html.P('metereological indicator:'),
        IndicatorSelector
    ]),

    html.Div(children=[
        html.P('date:'),
        DateSelector
    ]),

    html.Div(children=[
        html.P('region name:'),
        RegionSelector
    ]),

    html.Div(children=[
        html.P('trigger level:'),
        TriggerSelector
    ]),

    # --- dump the graphs below ---
    html.Div(children=[GraphBarChart, GraphTimeSeries],
             style={'columnCount': 2})
])




# --- interactivity ----
@app.callback(
    dash.dependencies.Output('graph-indicator-vs-time','figure'),
    [dash.dependencies.Input('indicator-selection','value'),
     dash.dependencies.Input('region-selection','value'),
     dash.dependencies.Input('trigger-level-selection','value')
     ])
def update_graph_timeseries(indicator, region, trigger_lvl):
    return graphTIME.create_graph(fileName, indicator, region, trigger_lvl)


@app.callback(
    dash.dependencies.Output('graph-indicator-vs-region','figure'),
    [dash.dependencies.Input('indicator-selection','value'),
     dash.dependencies.Input('date-selection','value'),
     dash.dependencies.Input('trigger-level-selection','value')
     ])
def update_graph_barchart(indicator, date, trigger_lvl):
    return graphBAR.create_graph(fileName, indicator, date, trigger_lvl)



# --- Run App when excecuting this code ---
if __name__ == '__main__':
    app.run_server(debug=True)

