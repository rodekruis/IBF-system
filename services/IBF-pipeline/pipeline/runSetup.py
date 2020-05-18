from lib.setup.createSchema import createSchema
from lib.setup.createSubFolders import createSubFolders
from lib.setup.staticDataDb import uploadStaticToDb, processStaticDataDb

from lib.logging.logglySetup import logger

def main():
    logger.info('Started Setup')
    
    #Folder structure
    createSubFolders()
    
    #Postgres database
    createSchema()
    uploadStaticToDb('glofas_stations','Glofas_station_locations_with_trigger_levels.csv')
    uploadStaticToDb('waterstation_per_district','Glofas_station_per_district.csv')
    uploadStaticToDb('metadata_fbf_zambia','metadata_fbf_zambia.csv')
    uploadStaticToDb('pcode_mapping_wards_new_distcode','pcode_mapping_wards_new_distcode.csv')
    uploadStaticToDb('redcross_branches','points/RedCross_branches.csv')
    uploadStaticToDb('healthsites','points/healthsites.csv')
    uploadStaticToDb('waterpoints','points/wpdx_data_export-2019-07-01T10-05-44.csv')
    processStaticDataDb()
    
    logger.info('Finished Setup')

if __name__ == '__main__':
    main()