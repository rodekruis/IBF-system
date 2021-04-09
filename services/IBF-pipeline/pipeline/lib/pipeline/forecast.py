from lib.logging.logglySetup import logger
from lib.pipeline.glofasdata import GlofasData
from lib.pipeline.rainfalldata import RainfallData
from lib.pipeline.floodExtent import FloodExtent
from lib.pipeline.exposure import Exposure
from lib.pipeline.dynamicDataDb import DatabaseManager
import pandas as pd    
import json


class Forecast:
    def __init__(self, leadTimeLabel, leadTimeValue, country_code, model):
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue 
        self.db = DatabaseManager(leadTimeLabel, country_code)

        self.admin_area_gdf = self.db.downloadGeoDataFromDb('IBF-app','adminArea', country_code=country_code)
        self.admin_area_test = self.db.apiGetRequest('adminAreas',country_code=country_code)
        print(self.admin_area_test)
        
        if model == 'glofas':
            self.glofas_stations = self.db.apiGetRequest('glofasStations',country_code=country_code)
            self.district_mapping = self.db.apiGetRequest('adminAreas/station-mapping',country_code=country_code)
            self.glofasData = GlofasData(leadTimeLabel, leadTimeValue, country_code, self.glofas_stations,self.district_mapping)
            self.floodExtent = FloodExtent(leadTimeLabel, leadTimeValue, country_code,self.district_mapping,self.admin_area_gdf)
            self.exposure = Exposure(leadTimeLabel, country_code,self.admin_area_gdf,self.district_mapping)
  
        if model == 'rainfall':
            self.rainfall_triggers,self.rainfall_cols = self.db.downloadDataFromDb('IBF-static-input','EGY_rainfall_trigger_levels')
            self.rainfallData = RainfallData(leadTimeLabel, leadTimeValue, country_code, self.admin_area_gdf, self.rainfall_triggers, self.rainfall_cols)
            self.exposure = Exposure(leadTimeLabel, country_code, self.admin_area_gdf)
