from lib.pipeline.extractGlofasData import extractGlofasData
from lib.pipeline.processGlofasData import processGlofasData
from lib.pipeline.makeFloodExtent import makeFloodExtent
from lib.pipeline.dynamicDataDb import uploadDynamicToDb, processDynamicDataDb
from lib.logging.logglySetup import logger

def main():
    logging.basicConfig(filename='setup.log', level=logger.info)
    logger.info('Started ...')
    extractGlofasData()
    processGlofasData()
    currentFloodExtentPaths = makeFloodExtent()
    print(currentFloodExtentPaths)
    uploadDynamicToDb('triggers_rp_per_station','triggers_rp')
    uploadDynamicToDb('calculated_affected','affected')
    processDynamicDataDb()
    logger.info('Finished ...')

if __name__ == '__main__':
    main()