from lib.logging.logglySetup import logger
from lib.cronJob.glofasdata import GlofasData
from lib.cronJob.rainfalldata import RainfallData
from lib.cronJob.floodExtent import FloodExtent
from lib.cronJob.dynamicDataDb import DatabaseManager
from lib.cronJob.lizard import LizardData

class Forecast:
    def __init__(self, fcStep, days):
        self.fcStep = fcStep
        self.days = days 
        # self.glofasData = GlofasData(fcStep, days)
        self.rainfallData = RainfallData(fcStep, days)
        # self.floodExtent = FloodExtent(fcStep, days)
        self.db = DatabaseManager(fcStep)
        self.lizardData = LizardData()
