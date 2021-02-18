# -*- coding: utf-8 -*-
"""
Date: July 2020
Authors: Lisanne van Brussel (lisanne.van.brussel@vodw.ey.com)


This is the configuration dict for the classes ReadData and TransformDataConnectAreas.
"""

    
cfg = {
        # Path GloFAS Grid cell data
        'path_discharge_gridcells' : 'c:\\Users\\BOttow\\Documents\\IBF-system\\trigger-model-development\\flood\\trigger-model\\glofas_station_selection_tool\\2017_11',   
        
        # Directory to shapefiles of rivers and admin boundaries
        'path_shp_rivers' : 'c:\\Users\\BOttow\\Rode Kruis\\team-Data-Team-E&Y-510@rodekruis.nl - GloFAS_station_selection_tool_data\\shapefiles\\Rivers\\',
        'file_shp_rivers': 'Rivers_hydroshed_cliped_uga.shp',
        'path_shp_admin_boundaries' : 'c:\\Users\\BOttow\\Rode Kruis\\team-Data-Team-E&Y-510@rodekruis.nl - GloFAS_station_selection_tool_data\\shapefiles\\admin_boundaries\\',
        'file_shp_admin_boundaries' : 'uga_adminboundaries_1.shp',
        
        # Coordinates - bounding boxes of country
        'country' : 'uganda',
        'lat_min' : -1.55, # minimal latitude, must be a duplicate of 0.05
        'lat_max' : 4.25, # maximal latitude
        'lon_min' : 29.55, # minmal longitude, must be a duplicate of 0.05
        'lon_max' : 35.05, # maximal longitude
        'steps_coordinates' : 0.1, # Standard based on GloFAS 0.1x0.1 degree grid cells, don't change this.

        
        # Coherence areas settings
        'percentile' : 0.95, 
        'neighbour_rounds' : 1, # integer, 1 is 8 neighbours, 2 is 24 neighbours)

        # Selection of number of files (if needed an integer, else None tot select all data)
        'nr_files' : None,
        
        # Boolean to save data
        'save_final_data' : True,
        # Path where data should be stored
        'path_save_data': 'c:\\Users\\BOttow\\OneDrive - Rode Kruis\\Documenten\\stationselectiontooldata\\output\\'
        }


"""
# Coordinates - bounding boxes of country
'country' : 'uganda',
'lat_min' : -1.55, # minimal latitude, must be a duplicate of 0.05
'lat_max' : 4.25, # maximal latitude
'lon_min' : 29.55, # minmal longitude, must be a duplicate of 0.05
'lon_max' : 35.05, # maximal longitude
'steps_coordinates' : 0.1, # Standard, don't change this.

# Coordinates - bounding boxes of country
'country' : 'kenya',
'lat_min' : -4.75, # minimal latitude, must be a duplicate of 0.05
'lat_max' : 4.65, # maximal latitude
'lon_min' : 33.85, # minmal longitude, must be a duplicate of 0.05
'lon_max' : 41.95, # maximal longitude
'steps_coordinates' : 0.1, # Standard, don't change this.

# Coordinates - bounding boxes of country
'country' : 'ethiopia',
'lat_min' : 3.35, # minimal latitude, must be a duplicate of 0.05
'lat_max' : 14.95, # maximal latitude
'lon_min' : 32.95, # minmal longitude, must be a duplicate of 0.05
'lon_max' : 48.05, # maximal longitude
'steps_coordinates' : 0.1, # Standard, don't change this.

"""