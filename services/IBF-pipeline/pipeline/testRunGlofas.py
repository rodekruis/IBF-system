from lib.cronJob.forecast import Forecast
from lib.cronJob.floodExtent import FloodExtent
# from lib.cronJob.extractGlofasData import extractGlofasData
# from lib.cronJob.processGlofasData import processGlofasData
# from lib.cronJob.makeFloodExtent import makeFloodExtent
# from lib.cronJob.dynamicDataDb import uploadDynamicToDb, processDynamicDataDb
from lib.logging.logglySetup import logger
from settings import *

def main():
    # logging.basicConfig(filename='setup.log', level=logger.info)
    logger.info('Started ...')
    for fcStep, days in LEAD_TIMES.items():
        fc = Forecast(fcStep, days)
        fc.glofasData.process()
        # extractGlofasData()
        # processGlofasData()
        currentFloodExtentPaths = FloodExtent(fcStep, days)
        print(currentFloodExtentPaths)
    # uploadDynamicToDb('triggers_rp_per_station','triggers_rp')
    # uploadDynamicToDb('calculated_affected','affected')
    # processDynamicDataDb()
    logger.info('Finished ...')

if __name__ == '__main__':
    main()