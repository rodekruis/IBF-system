import os
from settings import *

def createSubFolders():
    
    folders = [
        GEOSERVER_DATA+'output/0/livestock/',
        GEOSERVER_DATA+'output/0/population/',

        GEOSERVER_DATA+'output/0/cropland/',
        GEOSERVER_DATA+'output/0/flood_extents/',
        GEOSERVER_DATA+'output/1/',
        PIPELINE_DATA+'temp/',
        PIPELINE_DATA+'output/flood_extents/',
        PIPELINE_DATA+'output/flood_extents/short/',
        PIPELINE_DATA+'output/flood_extents/long/',
        PIPELINE_DATA+'output/triggers_rp_per_station/',
        PIPELINE_DATA+'output/glofas_extraction/',
        PIPELINE_DATA+'output/calculated_affected/',
    ]

    for folder in folders:
        if not os.path.exists(folder):
            os.makedirs(folder)
