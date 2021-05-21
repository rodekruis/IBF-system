from lib.logging.logglySetup import logger
from lib.pipeline.glofasdata import GlofasData
from lib.pipeline.rainfalldata import RainfallData
from lib.pipeline.floodExtent import FloodExtent
from lib.pipeline.exposure import Exposure
from lib.pipeline.dynamicDataDb import DatabaseManager
import pandas as pd    
import json
from shapely import wkb, wkt
import geopandas


class Forecast:
    def __init__(self, leadTimeLabel, leadTimeValue, countryCodeISO3, model):
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue 
        self.db = DatabaseManager(leadTimeLabel, countryCodeISO3)

        self.admin_area_gdf = self.db.downloadGeoDataFromDb('IBF-app','admin-area', countryCodeISO3=countryCodeISO3)
        
        if model == 'glofas':
            self.glofas_stations = self.db.apiGetRequest('glofas-stations',countryCodeISO3=countryCodeISO3)
            self.district_mapping = self.db.apiGetRequest('admin-areas/station-mapping',countryCodeISO3=countryCodeISO3)
            self.glofasData = GlofasData(leadTimeLabel, leadTimeValue, countryCodeISO3, self.glofas_stations,self.district_mapping)
            self.floodExtent = FloodExtent(leadTimeLabel, leadTimeValue, countryCodeISO3,self.district_mapping,self.admin_area_gdf)
            self.exposure = Exposure(leadTimeLabel, countryCodeISO3,self.admin_area_gdf,self.district_mapping)
  
        if model == 'rainfall':
            self.rainfall_triggers = self.db.apiGetRequest('rainfall-triggers',countryCodeISO3=countryCodeISO3)
            self.rainfallData = RainfallData(leadTimeLabel, leadTimeValue, countryCodeISO3, self.admin_area_gdf, self.rainfall_triggers)
            self.exposure = Exposure(leadTimeLabel, countryCodeISO3, self.admin_area_gdf)
