##################################################################
# Import functions
##################################################################
import os
import pandas as pd 
import numpy as np

import dash 
import dash_html_components as html
import dash_core_components as dcc 
import dash_leaflet as dl
from dash_leaflet import express as dlx
from dash.dependencies import Input, Output

from shapely.geometry import shape, Point
import json
from datetime import datetime, timedelta
import re

import plotly.graph_objects as go

import rasterio
from rasterio.features import shapes

##################################################################
# Load data
##################################################################
# Specify current working directory 
#workdirectory_data= 'C:\\Users\\nlbanni5\\Documents\\Rode Kruis\\connected_areas\\rode-kruis\\connected_areas'
workdirectory_data= 'c:\\Users\\BOttow\\Rode Kruis\\team-Data-Team-E&Y-510@rodekruis.nl - GloFAS_station_selection_tool_data'

os.chdir(workdirectory_data)

# Read in percentage data
df_perc_loaded = pd.read_csv('stored_data_uganda\\df_percentages_10yr_95percentile.csv').set_index('Unnamed: 0')

# Read in GloFAS data
df_glofas = pd.read_csv('stored_data_uganda\\df_discharge_10yr_uganda.csv').sort_values('date')

# Get xx return period xx percentiles per column (= per gridcell)
df_percentile_thresholds = pd.DataFrame(df_glofas.set_index('date').quantile(
                                                                   q=0.95, 
                                                                   axis=0,
                                                                   interpolation='linear')
                                                                   ).T.reset_index(drop=True)

# Read in station locations 
df_stations = pd.read_csv('stored_data_uganda\\rp_glofas_station.csv')
 
# Read in layers (grid, rivers, waterbodies, districts)
with open("shapefiles\\grid_layers\\grid_layer_2.json", 'r') as f:
    grid = json.load(f)

with open("shapefiles\\Rivers\\Rivers_hydroshed_cliped_uga.json", 'r') as f:
    rivers = json.load(f)

with open("shapefiles\\admin_boundaries\\uga_adminboundaries_1.json", 'r') as f:
    admin_boundaries = json.load(f)

# Set directory to floodscan data folder
wd_floodscan = workdirectory_data +  '\\Uganda_1998-2019'


##################################################################
# Define functions
##################################################################
def select_neighbours_percentages(data_perc_overlap: pd.DataFrame = df_perc_loaded,                                 
                                  poi_start: str = '2.45_32.25',      
                                  steps: int = 10,
                                  limit: int = 60,
                                  verbose = False
                                 ) -> pd.DataFrame():
    """
    This function calculates the overlap percentage of the selected cell ('poi_start') and its neighbours, 
    and selects the cell with the highest overlap percentage.
    After selecting the highest overlapping neighbour, it will iteratively select the neighbour with the maximum percentage, 
    and if undetermined calculate the percentage overlap the new neighbours. This process will continue until the maximal % is 
    below the specified limit, or when the number of steps of the iterative process is reached.
    
    Arguments
    ----------------
    data_perc_overlap: pd.DataFrame()
        default: df_perc_loaded 
        Pandas dataframe with all the glofas cells (rows and columns). 
        The values are the % overlapping extreme discharge days of the gridcell (row) and its neighbours (columns).
        
    poi_start: str
        default: '2.45_32.25' - arbitrary coords in uganda 
        The midpoint ('latitude_longitude') of the selected cell in the map.
    
    steps: int
        default: 10 
        Number of steps, e.g. the number of times a new point of interest (cell w/ maximum percentage) should be selected.
        
    limit: int
        default: 60
        Minimal percentage needed to select a new neighbour as point of interest (poi).
        
    verbose: bool
        default: False
        Whether or not to print some information.
        
    
    Output
    ----------------
    df_total_selected: pd.DataFrame()
        Pandas dataframe with the Points Of Interest (POIs), the neighbours and the corresponding percentage of overlap.
        
    """

    # Select neighbours of point of interest
    df_total_selected = data_perc_overlap[poi_start].dropna().reset_index().rename(
                                columns={'Unnamed: 0': 'neighbour', poi_start: 'percentage'})
    df_total_selected['poi'] = poi_start
    df_total_selected['nbr_poi'] = 0
    
    # Select neighbour of poi with max perc
    max_percentage = df_total_selected.iloc[df_total_selected['percentage'].argmax(),1]
    neighbour_max = df_total_selected.iloc[df_total_selected['percentage'].argmax(),0]
    
    if max_percentage > limit: 
        df_total_selected.loc[df_total_selected.neighbour == neighbour_max, 'selected'] = 1
        
        if verbose:
            print('\nSelected neighbour: ', str(neighbour_max))
            print('Selected cell/poi in first place:', 
                  df_total_selected.loc[df_total_selected.neighbour == neighbour_max, 'poi'].item())
            print('Percentage overlap: ',
                  round(df_total_selected.loc[df_total_selected.neighbour == neighbour_max, 'percentage'].item()))
            
        for step in range(steps):
            
            try: 
                
                df_neighbours_new = data_perc_overlap[neighbour_max].dropna().reset_index().rename(
                        columns={'Unnamed: 0': 'neighbour', neighbour_max: 'percentage'})
                df_neighbours_new['poi'] = neighbour_max

                # Only keep the new grid cells
                list_cells_already_selected = df_total_selected.neighbour.tolist() + df_total_selected.poi.unique().tolist()
                df_neighbours_new = df_neighbours_new.loc[~df_neighbours_new.neighbour.isin(list_cells_already_selected)]
                df_neighbours_new['nbr_poi'] = step + 1
                
                # Add the new select neighbours to the total dataframe
                df_total_selected = df_total_selected.append(df_neighbours_new, ignore_index = True)
                
                # Select the max neighbour
                max_percentage = df_total_selected.iloc[df_total_selected.loc[
                                                        df_total_selected.selected != 1]['percentage'].idxmax(),1]
                neighbour_max = df_total_selected.iloc[df_total_selected.loc[
                                                        df_total_selected.selected != 1]['percentage'].idxmax(),0]
                if max_percentage > limit: 
                    df_total_selected.loc[df_total_selected.neighbour == neighbour_max, 'selected'] = 1
                    
                    if verbose:
                        print('\nSelected neighbour: ', str(neighbour_max))
                        print('Selected cell/poi in first place:', df_total_selected.loc[df_total_selected.neighbour == 
                                                                                         neighbour_max, 'poi'].item())
                        print('Percentage overlap: ', round(df_total_selected.loc[df_total_selected.neighbour == neighbour_max, 
                                                                                  'percentage'].item()))
                else: 
                    break
            
            except: 
                print('End')

    
    return(df_total_selected)
    
def get_color(perc):
    """
    This function will return a color code based on the input percentage.   
    
    Arguments
    ----------------
    perc: float
        Percentage of overlap of extreme days of the cell and the point of interest.
    
    Output
    ----------------
    col: str
        Color code        
    """
    
    if perc > 80:
        col = '#08519C'
    elif perc > 60:
        col = '#3182BD'
    elif perc > 40:
        col =  '#6BAED6'
    elif perc > 20:
        col = '#BDD7E7'
    else:
        col = '#EFF3FF'
    return (col)

def get_districts(df: pd.DataFrame = None, 
                  districts: json = admin_boundaries,
                  points: list = [],
                  district_list: list = []
                 ) -> list :
    """
    This function will return a list with all districts in which the points of interests lie.
    So, if one selects a cell in the map, it will determine the path of points of interests.
    Based on the location of the (about) 10x10km grid cells, the districts are determined.
    
    Arguments
    ----------------
    df: pd.DataFrame()
        default: None
        Pandas DataFrame with the latitude and longitude the point of interests.
    
    disctricts: (geo)json
        default: admin_boundaries
        json/shapefile with the districts/admin boundaries of uganda.
    
    points: list
        default: []
        Empty list, points of interest should be added to this list.
        
    points: district_list
        default: []
        Empty list, districts should be added to this list.
    
    Output
    ----------------
    list(dict.fromkeys(district_list)): list
        List with the disctricts connected to the points of interests.
    """
    # Empty: current lists 
    district_list.clear()
    points.clear()
    
    # Create outlines of each gridcell and add all the cornerpoints in df to list: points 
    for index, row in df.iterrows():
        lat = float(row['lat'])
        lon = float(row['lon'])
        point = Point(lon, lat)        
        combis_coordinates = [[ [round(lon-0.05,2), round(lat-0.05,2)], 
                                [round(lon-0.05,2), round(lat+0.05,2)], 
                                [round(lon+0.05,2), round(lat+0.05,2)],
                               [round(lon+0.05,2), round(lat-0.05,2)]
                              ]]
        points.append(combis_coordinates)
    
    # Determine for each point whether it intersects with district polygon(s)
    # Append each district to district_list 
    for point in points: 
        point = shape({'type': 'Polygon', 'coordinates': point})
        for feature in districts['features']:
                polygon = shape(feature['geometry'])
                if polygon.intersects(point):
                    district_list.append(feature['properties']['ADM2_EN'])
              
    return(list(dict.fromkeys(district_list)))
    
def get_flood_polygons(path_floodscan_tifs: str = wd_floodscan,
                       bounds_uganda: list = [],
                       start_date = None, 
                       end_date = None
                      ) -> list:
    
    """
    This function will load the FloodScan tif-files of the days between the start_date and end_date. 
    These files will be summarized (max) in one numpy array, such that one file is created for the whole date range ('1' = Flood).
    Then, the boundaries of the country will be filtered out, and the coordinates polygons of the 
    flooded areas are stored in a list.
    
    Arguments
    ----------------
    path_floodscan_tifs: pd.DataFrame()
        default: None
        Pandas DataFrame with the latitude and longitude the point of interests.
    
    bounds_uganda: list
        default: []
        Coordinates of the bounding box of the country [[lat_min, lon_min], [lat_max,lon_max]].
    
    start_date: 
        default: None
        Start date of the selected date range.
        
    end_date: 
        default: None
        End date of the selected date range.
    
    Output
    ----------------
    fl_coords_list: list
        List with the coordinates of the polygons of the flooded areas within the selected date period.
    """
        
    # Transform dtype of the dates    
    start_date = datetime.strptime(str(start_date), '%Y-%m-%d').date()
    end_date = datetime.strptime(str(end_date), '%Y-%m-%d').date()

    # Select directory of start/begin year
    directory_start_date_year = path_floodscan_tifs + '\\' + str(start_date.year)
    directory_end_date_year = path_floodscan_tifs + '\\' + str(end_date.year)

    # Select all dates between start and end date
    dates_in_range = [str(start_date + timedelta(days=x)).replace('-', '') for x in range((end_date-start_date).days + 1)]

    # Extract date from filenames and filter based on dates_in_range
    tifs_selected_start = [directory_start_date_year + '\\' + tif for tif in os.listdir(directory_start_date_year) if 
                           re.search("([0-9]{8})", tif).group(1) in dates_in_range]
    tifs_selected_end = [directory_end_date_year + '\\' + tif for tif in os.listdir(directory_end_date_year) if 
                           re.search("([0-9]{8})", tif).group(1) in dates_in_range]
    # Put them into one list
    tif_files  = tifs_selected_start + tifs_selected_end
    # Drop duplicates
    tif_files = list(dict.fromkeys(tif_files))

    # Merge tif-files of selected date range, use max
    # Parse image elements and store data in results
    total_image = np.empty([1,1])  
    
    with rasterio.Env():
        for i, tif_file in enumerate(tif_files): 
            with rasterio.open(tif_file) as src:
                image = src.read(1)
                if i == 0:
                    total_image = image
                else:
                    total_image = np.fmax(total_image, image)
        total_image = total_image.astype('uint8')
        results = ({'properties': {'raster_val': v}, 'geometry': s
                   } for i, (s, v) in enumerate(shapes(total_image, mask=None, transform=src.transform)))

    # Convert results to a list called geoms
    geoms = list(results)
    
    # Flood coordinates
    flood_coords = [flood['geometry']['coordinates'] for flood in geoms]
    floods_polygons = [item for sublist in flood_coords for item in sublist]

    # Filter out the bounding box coordinates/polygons
    new_geoms = [[l for l in pol if (l[0]>(bounds_uganda[0][1] + 0.01) and l[0]<(bounds_uganda[1][1]-0.01) and 
                                     l[1]>(bounds_uganda[0][0] + 0.01) and l[1]<(bounds_uganda[1][0]-0.01))
                 ] for pol in floods_polygons]

    # Get length of polygons
    len_old = [len(pol) for pol in floods_polygons]
    len_new = [len(pol) for pol in new_geoms]
    df_len = pd.DataFrame({'old': len_old, 'new': len_new})
    # Only keep polygons that have same length (of coordinates) 
    keep = df_len.loc[df_len['old']==df_len['new']].index.to_list()
    floods_pol_new = [floods_polygons[n] for n in keep]

    # Switch: order lat/lon, input order varies depending on tool 
    fl_coords_list = []
    for coords in floods_pol_new: 
        points = []
        for point in coords: 
            rev_point = point[::-1]
            points.append(rev_point)
        fl_coords_list.append(points)
        
    return(fl_coords_list)

def show_discharge_graph(cell_selected: str = None,
                         data_glofas: pd.DataFrame = df_glofas,
                         data_percentiles: pd.DataFrame = df_percentile_thresholds
                        ) -> go.Figure():
    
    """
    This function will create a figure with the discharge level of the selected cell over time and
    line with the 10 year return period 95 percentile of that cell.
    
    Arguments
    ----------------
    cell_selected: str
        default: None
        Selected cell ('latitude_longitude').
    
    data_glofas: pd.DataFrame()
        default: df_glofas
        Pandas DataFrame with GloFAS discharge levels of each day (rows, from 2010 on) and each grid cell (columns).
        
    data_percentiles: pd.DataFarme()
        default: df_percentile_thresholds
        Pandas dataframe with the 10 year return period 95 percentiles of each grid cell (columns).
    
    Output
    ----------------
    fig: go.Figure()
        Figure with the GloFAS discharge level of the selected cell over time, 
        and a line with the 10 year return period 95 percentile of that cell.
    """
    
    # Select data of selected point
    df = data_glofas[['date', cell_selected]]
    df.insert(1, 'threshold', data_percentiles[cell_selected].item() )

    # Create line graph
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df['date'], y=df[cell_selected],
                             name = 'discharge',
                             line=dict(color='royalblue')))

    fig.update_traces()
    
    # Add 95 percentile threshold line
    fig.add_trace(go.Scatter(x=df['date'], y=df['threshold'],
                             name = '95 percentile'))

    fig.update_traces(mode="lines", hovertemplate=None)

    # Edit the layout
    fig.update_layout(title_font_size = 20,
                      font_color = 'black',
                      title = 'GloFAS discharge of selected cell',
                      xaxis_title='Date',
                      yaxis_title='GloFAS discharge',                      
                      showlegend=False,
                      plot_bgcolor="white",
                      hovermode="x unified",
                      yaxis_hoverformat = '.2f'                      
                     )
    
    fig.update_xaxes(title_font_size = 14)
    fig.update_yaxes(title_font_size = 14)
    
    return(fig)

##################################################################
# Webapp / interactive map
##################################################################

"""
    ----
    This app generates the interactive GloFAS station selection tool. 
    Currently running on a development server, app can be used by copy pasting: 
    http://127.0.0.1:8050/ in your chrome browser.
    ----

    Function dependencies: 
    ----------------
    - select_neighbours_percentages
    - show_discharge_graph
    - get_flood_polygons
    - get_districts
    - get_color 

    File dependencies: 
    ----------------
    Tables: 
    - df_percentages_10yr_95percentile.csv - matching % neighbours uganda 
    - df_discharge_10yr_uganda.csv - glofas discharge data (uganda)
    - rp_glofas_station.csv - coords of current virtual stations
    
    Map-layers:
    - grid_layer_1.json - grid Uganda
    - Rivers_hydroshed_cliped_uga.json - river layer
    - uga_adminboundaries_1.json - district boundaries
"""
 
global steps
steps = 10
global min_perc
min_perc = 60
global districts_df 
districts_df = {}

# Filter: uganda stations from stations df 
stations_uganda = df_stations[df_stations.Country=='Uganda']

# Define: setting of enhanced border weight triggerd by hovering
options = dict(hoverStyle=dict(weight = 5, color = '#666', dashArray = ''), zoomToBoundsOnClick=False)

# Define bounding box uganda ([[lat_min, lon_min], [lat_max,lon_max]])
bounds_uganda = [[-1.50, 29.50], [4.30, 35.10]]

# Define: style functions of grid and district borders 
def get_style(feature):
    return dict(fill = False, weight=1, opacity=1, color='white', dashArray='3', fillOpacity=0.1)
def get_style_grey(feature):
    return dict(fill = False, weight=1, opacity=0.8, color='black', dashArray='3', fillOpacity=0.1)
#def get_style_text(width: str = '30%', fontSize: int = 20):
#    return dict(width = width, display='inline-block') - probably delete> 

# Create color bar legend 
marks = [20,40,60,80]
colorscale = ['#EFF3FF', '#BDD7E7', '#6BAED6', '#3182BD', '#08519C']
ctg = ["{}+".format(mark, marks[i + 1]) for i, mark in enumerate(marks[:-1])] + ["{}+".format(marks[-1])]
color_bar = dlx.categorical_colorbar(categories = ctg, 
                                     colorscale=colorscale, width=300, height=30, position="bottomleft", className = 'legend')

# Parse river coords from rivers file 
river_coords = [river['geometry']['coordinates'] for river in rivers['features']]
coords_list = []
# Switch lat/lon, and append river coords to coords_list
for coords in river_coords: 
    points = []
    for point in coords: 
        rev_point = point[::-1]
        points.append(rev_point)
    coords_list.append(points)

# Transform gridded data in right style
grid_geo = dl.GeoJSON(data=grid, id="grid_geojson", options=dict(hoverStyle=dict(weight = 5, color = '#666', dashArray = ''), zoomToBoundsOnClick=False, style = dict(fill = False, weight=1, opacity=1, color='white', dashArray='3', fillOpacity=0.1)))
districts_geo = dl.GeoJSON(data=admin_boundaries, id="districts_geojson", options=dict(hoverStyle=dict(weight = 5, color = '#666', dashArray = ''), zoomToBoundsOnClick=False, style = dict(fill = False, weight=1, opacity=0.8, color='black', dashArray='3', fillOpacity=0.1)))
    
# Create: spatial file based on river geojson 
grid_rivers = dl.Polyline(positions = coords_list, weight = 1, fillColor = 'blue', fillOpacity = 0.7)                         

# Create app
app = dash.Dash(prevent_initial_callbacks=True)

# Define the layout of the app 
# App design partly done by using 'style' function within the HTML-elements 
# However, css file named layout_app.css handles the more intricate styling options 
app.layout = html.Div([ # title:  
                        html.H1('GloFAS station selection tool'),
                        html.Div([  
                            # Upper row w/ headers of the different elements 
                            html.Div(
                                html.H3('Number of steps'), 
                                style={'width': '29%', 'display': 'inline-block', 'font-size': '15px'},
                                className = 'app-header'),
                            html.Div(
                                html.H3('Minimal percentage of overlapping extreme days'), 
                                style={'width': '29%', 'display': 'inline-block', 'font-size': '15px'},
                                className = 'app-header'),
                            html.Div(
                                html.H3('Date range floodscan data'), 
                                style={'width': '19%', 'height':'30px', 'display': 'inline-block', 'font-size': '15px', 'margin-bottom' :'15px'},
                                className = 'app-header'),
                                html.Div(html.Img(src='assets/510_RedCross_logo.png'), style = {'display': 'inline'}, className = 'logo')
                        ]),
                        html.Div([
                            # Second row: contain filter elements of the app   
                            html.Div(    
                            dcc.Slider(
                                id='slider_steps',
                                min=0,
                                max=100,
                                step=1,
                                value=steps,
                                dots=True,
                                marks={
                                    5: '5', 10: '10',15: '15',20: '20',25: '25',30: '30',
                                    35: '35',40: '40',45: '45',50: '50',55: '55',60: '60',
                                    65: '65',70: '70',75: '75',80: '80',85: '85',90: '90',95: '95',100: '100'
                                })
                                ,style={'width': '30%', 'height':'30px', 'display': 'inline-block', 'vertical-align': 'top'},
                                className = 'slider'),               
                            html.Div(
                            dcc.Slider(
                                id='slider_min_perc',
                                min=0,
                                max=100,
                                step=5,
                                value=min_perc,
                                dots=True,
                                marks={
                                    0 : '0%', 20 : '20%', 40 : '40%',
                                    60 : '60%', 80: '80%', 100: '100%'
                                },
                                className = 'slider')
                            ,style={'width': '30%', 'height' : '30px', 'display': 'inline-block',  'vertical-align': 'top'}),
                            html.Div(
                                dcc.DatePickerRange(
                                    id='date_picker_range',  # ID to be used for callback
                                    calendar_orientation='horizontal',  # vertical or horizontal
                                    end_date_placeholder_text="end date",  # text that appears when no end date chosen
                                    reopen_calendar_on_clear=True,
                                    number_of_months_shown=2,  # number of months shown when calendar is open
                                    initial_visible_month=datetime(2019, 4, 20).date(),  # the month initially presented when the user opens the calendar
                                    start_date=datetime(2019, 4, 20).date(),
                                    end_date=datetime(2019, 4, 23).date(),
                                    display_format='DD-MM-YYYY',  # how selected dates are displayed in the DatePickerRange component.
                                ), className = 'date_picker_range'
                                ,style={'width': '20%', 'height': 'auto', 'display': 'inline-block', 'font-size': '15px','margin-left' : '15px', 'vertical-align':'top'})
                        ]),
                        html.Div([  
                            # Third row: contains checklist of elements to in/exclude 
                            html.Div(
                            dcc.Checklist(id="checklist_stations",
                                         options=[{'label': 'Show stations', 'value':'stations'}],
                                         value = False)
                                        ,style={'width': '15%', 'display':'inline-block', 'font-size':'15px', "font-weight":"bold", 'padding-top':'10px','padding-bot':'10px'}),
                            html.Div(
                            dcc.Checklist(id="checklist_floods",
                                         options=[{'label': 'Show floods', 'value':'floods'}],
                                         value = False)
                                         ,style={'width': '15%', 'display': 'inline-block', 'font-size':'15px',"font-weight":"bold",'padding-top':'10px','padding-bot':'10px'}),
                        ]),                        
                        html.Hr(),
                        # Fourth row: displays districts whenever a grid cell is selected
                        html.Div(id='print_districts', style={'font-size': '14px', 'display': 'inline-block'}),
                        html.Hr(),
                        html.Div([
                            html.Div(
                                # Fifth: row contains map and graph 
                                dl.Map(id="map",
                                # Order of this list determines overlay order 
                                children = [grid_rivers,
                                           dl.TileLayer(),                                        
                                           dl.LayerGroup(id="start_marker"), 
                                           dl.LayerGroup(id='rec_neighbours'),    
                                           dl.LayerGroup(id='rec_pois'),
                                           dl.LayerGroup(id='marker_stations'),
                                           dl.LayerGroup(id="marker_floods"),
                                           color_bar,
                                           grid_geo,
                                           districts_geo
                                          ],
                                   zoom=7, center = [1.40, 32.30],
                               doubleClickZoom = True,               
                               maxBounds  = bounds_uganda),
                               style={'width': '60%', 'height': '70vh', "display": "inline-block"}                               
                            ),
                            html.Div(
                                    dcc.Graph(
                                    id='discharge_graph'),
                                    style={'width': '40%', 'height': '70vh', "display": "inline-block"}
                                    ),                         
                            ])   
        ])

# Plot discharge
@app.callback(Output("discharge_graph", "figure"),
              [Input("map", "click_lat_lng")])
def update_graph(click_lat_lng):    
    # cell selected
    lat_min = np.floor(click_lat_lng[0]*10)/10
    lon_min = np.floor(click_lat_lng[1]*10)/10    
    poi_start = str(round((lat_min + 0.05),2)) + '_' + str(round((lon_min+0.05),2))    
    return show_discharge_graph(cell_selected = poi_start)

# Show stations
@app.callback(Output("marker_stations", "children"), 
              [Input("checklist_stations", 
                     "value")])
def update_output(value):
    if 'stations' in value:
        return [dl.Marker(position=[row['lat'], row['lon']], children=dl.Tooltip(row['ID'])) for i, 
                               row in stations_uganda.iterrows()]
    else:
        return None

# Show floods
@app.callback(Output("marker_floods", "children"), 
              [Input("checklist_floods", 'value'),
               Input('date_picker_range', 'start_date'),
                Input('date_picker_range', 'end_date')])
def update_output(value, start_date, end_date):   
    if value is False:
        return None
    elif 'floods' in value:
        fl_coords_list = get_flood_polygons(bounds_uganda=bounds_uganda,
                                           start_date = start_date,
                                           end_date = end_date)
        return [dl.Polygon(positions = pol, weight = 1, fill = True, fillColor='red',
                        opacity=1, color='red', fillOpacity=0.5) for pol in fl_coords_list]
    else:
        return None

# Show path
@app.callback([Output("start_marker", "children"),
               Output("rec_neighbours", "children"), 
              Output("rec_pois", "children"),
              Output("print_districts", "children")],
              [Input("map", "click_lat_lng"),
              Input("slider_steps", "value"),
              Input("slider_min_perc", "value")])

def map_click(click_lat_lng, steps, min_perc):
    lat_min = np.floor(click_lat_lng[0]*10)/10
    lat_max = np.ceil(click_lat_lng[0]*10)/10
    lon_min = np.floor(click_lat_lng[1]*10)/10
    lon_max = np.ceil(click_lat_lng[1]*10)/10
    
    poi_start = str(round((lat_min + 0.05),2)) + '_' + str(round((lon_min+0.05),2))
    df_output = select_neighbours_percentages(poi_start = poi_start, steps = steps, limit = int(min_perc))
    
    # All points of interest (cells with % larger than minimal percentage)
    new_pois = df_output.poi.unique().tolist()
    # Add column with lat and lon to df_selection
    lat = [x.split('_')[0] for x in new_pois]
    lon = [x.split('_')[1] for x in new_pois]
    df_pois = pd.DataFrame(columns=["lat", "lon"], data=np.column_stack((lat,lon)))
    
    # Get disctricts connected to POIS
    districts_df = get_districts(df=df_pois, districts = admin_boundaries) 
    if len(districts_df) > 0:
        districts_return = 'The connected disctricts are: ' + str(districts_df).strip('[]')
    else:
        districts_return = 'No connected districts found.'
    
    # All neighbours
    new_nbrs = df_output.neighbour.unique().tolist()
    # Add column with lat and lon to df_selection
    lat = [x.split('_')[0] for x in new_nbrs]
    lon = [x.split('_')[1] for x in new_nbrs]
    perc = [str(round(x)) for x in df_output.percentage.tolist()]
    df_nbr = pd.DataFrame(columns=["lat_lon", "lat", "lon", "perc"], data=np.column_stack((new_nbrs, lat,lon,perc)))

    # Add number of pois
    df_nr_pois = df_output[['poi', 'nbr_poi']].drop_duplicates()
    df_nr_pois['nbr_poi'] = 'order nr: ' + df_nr_pois['nbr_poi'].astype(int).astype(str)
    df_nbr = df_nbr.merge(df_nr_pois, how='left', left_on='lat_lon', right_on='poi').drop(['poi'], axis=1)
    df_nbr = df_nbr.fillna('')
    
    # Create: the selected colored path of POIs and their neighbours  
    return [dl.Marker(position=click_lat_lng, children=dl.Tooltip('start '+"({:.2f}, {:.2f})".format(*click_lat_lng) )) 
              ],[
                  dl.Rectangle(bounds=[[round(float(row['lat'])-0.05,2), round(float(row['lon'])-0.05,2)],
                                 [round(float(row['lat'])+0.05,2), round(float(row['lon'])+0.05,2)]],
                                stroke = False, 
                                fillColor= get_color(float(row['perc'])),
                                weight = 1, 
                                opacity = 1,
                                fillOpacity = .7,
                                children=dl.Tooltip(row['perc']+'%   ' + row['nbr_poi'])) for i, row in df_nbr.iterrows()
                   ], [
                        dl.Rectangle(bounds=[[round(float(row['lat'])-0.05,2), round(float(row['lon'])-0.05,2)],
                                                     [round(float(row['lat'])+0.05,2), round(float(row['lon'])+0.05,2)]],
                                    fill = False, 
                                    opacity = .65, 
                                    color = 'blue') for i, row in df_pois.iterrows()
                    ], districts_return

if __name__ == '__main__': 
    app.run_server(debug=False)