# -*- coding: utf-8 -*-
"""
Date: July 2020
Authors: Lisanne van Brussel (lisanne.van.brussel@vodw.ey.com)


This is the configuration dict for CoherenceAreas objects.
"""

    
cfg = {
        # Path GloFAS Grid cell data
        'path_discharge_gridcells' : 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis\\data_all_2010_2019',      
        
        # Coordinates - bounding boxes of country
        'country' : 'uganda',
        'lat_min' : -1.55, # minimal latitude, must be a duplicate of 0.05
        'lat_max' : 4.25, # maximal latitude
        'lon_min' : 29.55, # minmal longitude, must be a duplicate of 0.05
        'lon_max' : 35.05, # maximal longitude
        'steps_coordinates' : 0.1, # Standard, don't change this.

        
        # Coherence areas settings
        'percentile' : 0.95, 
        'neighbour_rounds' : 1, # integer, 1 is 8 neighbours, 2 is 24 neighbours)

        # Selection of number of files (if needed an integer, else None tot select all data)
        'nr_files' : None,
        
        # Boolean to save data
        'save_final_data' : True,
        # Path where data should be stored
        'path_save_data': 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis\\save_data_test\\'        
        
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