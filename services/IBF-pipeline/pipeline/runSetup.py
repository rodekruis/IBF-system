from lib.setup.createSchema import createSchema
from lib.setup.createSubFolders import createSubFolders
from lib.setup.staticDataDb import uploadStaticToDb, processStaticDataDb
from settings import *
from secrets import *

from lib.logging.logglySetup import logger

def main():
    logger.info('Started Setup')
    
    #Folder structure
    createSubFolders()
    
    #Postgres database
    createSchema()
    for COUNTRY_CODE in COUNTRY_CODES:
        COUNTRY_SETTINGS = SETTINGS[COUNTRY_CODE]
        
        if COUNTRY_SETTINGS['model'] == 'glofas':
            uploadStaticToDb(COUNTRY_CODE + '_glofas_stations', COUNTRY_SETTINGS['trigger_levels'])
            uploadStaticToDb(COUNTRY_CODE + '_waterstation_per_district',COUNTRY_SETTINGS['district_mapping'])
        
        if COUNTRY_SETTINGS['model'] == 'rainfall':
            uploadStaticToDb(COUNTRY_CODE + '_rainfall_trigger_levels', COUNTRY_SETTINGS['trigger_levels'])

        # Only if aplicable
        # uploadStaticToDb(COUNTRY_CODE + '_redcross_branches',COUNTRY_SETTINGS['redcross_branches'])
    processStaticDataDb()
    
    logger.info('Finished Setup')

if __name__ == '__main__':
    main()