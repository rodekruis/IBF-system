from lib.setup.createSchema import createSchema
from lib.setup.createSubFolders import createSubFolders
from lib.setup.staticDataDb import uploadStaticToDb, processStaticDataDb
from settings import *

from lib.logging.logglySetup import logger

def main():
    logger.info('Started Setup')
    
    #Folder structure
    createSubFolders()
    
    #Postgres database
    createSchema()
    for COUNTRY_CODE in COUNTRY_CODES:
        COUNTRY_SETTINGS = SETTINGS[COUNTRY_CODE]
        uploadStaticToDb(COUNTRY_CODE + '_glofas_stations', COUNTRY_SETTINGS['trigger_levels'])
        uploadStaticToDb(COUNTRY_CODE + '_waterstation_per_district',COUNTRY_SETTINGS['district_mapping'])
    if CALCULATE_EXPOSURE:
        uploadStaticToDb('metadata','ibf_metadata.csv')
        #uploadStaticToDb('metadata_fbf_zambia','metadata_fbf_zambia.csv')
        # uploadStaticToDb('pcode_mapping_wards_new_distcode','pcode_mapping_wards_new_distcode.csv')
        # uploadStaticToDb('redcross_branches','points/RedCross_branches.csv')
        # uploadStaticToDb('healthsites','points/healthsites.csv')
        # uploadStaticToDb('waterpoints','points/wpdx_data_export-2019-07-01T10-05-44.csv')
        # uploadStaticToDb('UGA_flood_vulnerability','uga_vulnerability_eap.csv')
    processStaticDataDb()
    
    logger.info('Finished Setup')

if __name__ == '__main__':
    main()