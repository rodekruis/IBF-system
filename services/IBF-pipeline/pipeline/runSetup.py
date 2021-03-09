from lib.setup.createSchema import createSchema
from lib.setup.createSubFolders import createSubFolders
from lib.setup.staticDataDb import uploadStaticToDb
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

        # Only sources are left here, which have not been migrated to seed-script yet
        # Also, the processStaticData.sql script has been moved into IBF-database-scripts.sql
        
        if COUNTRY_SETTINGS['model'] == 'rainfall':
            uploadStaticToDb(COUNTRY_CODE + '_rainfall_trigger_levels', COUNTRY_SETTINGS['trigger_levels'])

        if COUNTRY_CODE = 'UGA' or COUNTRY_CODE = 'ZMB':
            uploadStaticToDb(COUNTRY_CODE + '_redcross_branches',COUNTRY_SETTINGS['redcross_branches'])
        
        if COUNTRY_CODE = 'UGA':
            uploadStaticToDb(COUNTRY_CODE + '_flood_vulnerability',COUNTRY_SETTINGS['flood_vulnerability'])
    
    logger.info('Finished Setup')

if __name__ == '__main__':
    main()