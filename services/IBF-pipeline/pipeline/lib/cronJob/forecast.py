from lib.logging.logglySetup import logger
from lib.cronJob.glofasdata import GlofasData
from lib.cronJob.rainfalldata import RainfallData
from lib.cronJob.floodExtent import FloodExtent
from lib.cronJob.dynamicDataDb import DatabaseManager

class Forecast:
    def __init__(self, fcStep, days, country_code):
        self.fcStep = fcStep
        self.days = days 
        self.glofasData = GlofasData(fcStep, days, country_code)
        self.rainfallData = RainfallData(fcStep, days, country_code)
        self.floodExtent = FloodExtent(fcStep, days, country_code)
        self.db = DatabaseManager(fcStep, country_code)
