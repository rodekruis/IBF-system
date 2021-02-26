from lib.logging.logglySetup import logger
from lib.cronJob.glofasdata import GlofasData
from lib.cronJob.rainfalldata import RainfallData
from lib.cronJob.floodExtent import FloodExtent
from lib.cronJob.dynamicDataDb import DatabaseManager

class Forecast:
    def __init__(self, fcStep, days, country_code, model):
        self.fcStep = fcStep
        self.days = days 
        self.db = DatabaseManager(fcStep, country_code)

        if model == 'glofas':
            self.glofas_stations,self.glofas_cols = self.db.downloadDataFromDb('IBF-static-input','dashboard_glofas_stations', country_code=country_code)
            self.district_mapping,self.district_cols = self.db.downloadDataFromDb('IBF-static-input','waterstation_per_district', country_code=country_code)
            self.glofasData = GlofasData(fcStep, days, country_code, self.glofas_stations, self.glofas_cols,self.district_mapping,self.district_cols)
            self.floodExtent = FloodExtent(fcStep, days, country_code,self.district_mapping,self.district_cols)
  
        if model == 'rainfall':
            self.rainfall_triggers,self.rainfall_cols = self.db.downloadDataFromDb('IBF-static-input','EGY_rainfall_trigger_levels')
            self.rainfallData = RainfallData(fcStep, days, country_code, self.rainfall_triggers, self.rainfall_cols)
            self.floodExtent = FloodExtent(fcStep, days, country_code)
