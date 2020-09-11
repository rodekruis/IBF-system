from datetime import date, timedelta


##########################
## DEVELOPMENT SETTINGS ##
##########################

# Disable these temporarily to run only the trigger-model part
CALCULATE_EXTENT = True
CALCULATE_EXPOSURE = True

# Use dummy-data and/or overwrite real data
GLOFAS_DUMMY = False
RAINFALL_DUMMY = False
OVERWRITE_DUMMY = True

# Change this date only in case of testing
CURRENT_DATE = date.today()
# CURRENT_DATE=date.today() - timedelta(days=1)


######################
## COUNTRY SETTINGS ##
######################

# For now indicate 1 country. Ultimately we might want to loop over multiple included countries?
COUNTRY_CODE='EGY' #'ZMB'/'UGA'/ 'EGY'

SETTINGS = {
    "ZMB": {
        "models": {
            "glofas": True,
            "rainfall": False
        },
        "trigger_levels": 'Glofas_station_locations_with_trigger_levels.csv',
        'district_mapping': 'Glofas_station_per_district.csv',
        'flood_extent_admin_boundaries': 'vector/ZMB_adm2_mapshaper_new103_pcode.shp',
        'exposure_admin_boundaries': 'vector/ZMB_adm2_mapshaper_new103_pcode.shp', #ZMB_adm4_mapshaper_reproj
        'metadata': 'metadata_fbf_zambia.csv',
        'trigger_colname': '10yr_threshold',
        'CRA_filename': 'ZMB_CRA_Indicators',
        'lead_times': {
            "short": 3,
            "long": 7
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_zmb_pop_resized_100",
                "rasterValue": 1
            },
            "cropland": {
                "source": "cropland/crop_resampled",
                "rasterValue": 0.0004 # value of pixel (0-100) reflects no. of cropland pixels in original crop-layer, where each pixel stands for 0.02x0.02=0.0004 km2
            },
            # "chicken": {
            #     "source": "livestock/Chicken",
            #     "rasterValue": 1
            # },
            # "cattle": {
            #     "source": "livestock/Cattle",
            #     "rasterValue": 1
            # },
            # "goat": {
            #     "source": "livestock/Goat",
            #     "rasterValue": 1
            # },
            # "pig": {
            #     "source": "livestock/Pig",
            #     "rasterValue": 1
            # },
            # "sheep": {
            #     "source": "livestock/Sheep",
            #     "rasterValue": 1
            # },
        }
    },
    "UGA": {
        "models": {
            "glofas": True,
            "rainfall": False
        },
        "trigger_levels": 'Glofas_station_locations_with_trigger_levels_IARP.csv',
        'district_mapping': 'Glofas_station_per_district_uga.csv',
        'flood_extent_admin_boundaries': 'vector/UGA_adm2_mapshaper.shp',
        'exposure_admin_boundaries': 'vector/UGA_adm2_mapshaper.shp',
        'metadata': 'uga_metadata.csv',
        'trigger_colname': '5yr_threshold',
        'CRA_filename': 'ZMB_CRA_Indicators',
        'lead_times': {
            "long": 7
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_uga_pop_resized_100",
                "rasterValue": 1
            }
        }
    },
    "EGY": {
        "models": {
            "glofas": False,
            "rainfall": True
        },
        "trigger_levels": 'Rainfall_station_locations_with_trigger_levels.csv',
        'district_mapping': 'Rainfall_station_per_district_uga.csv',
        'flood_extent_admin_boundaries': 'vector/egy_admbnda_adm1_capmas_20170421.shp',
        'exposure_admin_boundaries': 'vector/egy_admbnda_adm1_capmas_20170421.shp',
        'trigger_colname': '5yr_threshold',
        'CRA_filename': '',
        'lead_times': {
            "short": 3,
            "long": 7
        },
        'EXPOSURE_DATA_SOURCES': {}
    },
}
COUNTRY_SETTINGS = SETTINGS[COUNTRY_CODE]



###################
## MAIN SETTINGS ##
###################



LEAD_TIMES = COUNTRY_SETTINGS['lead_times']
RUN_GLOFAS = COUNTRY_SETTINGS['models']['glofas']
RUN_RAINFALL = COUNTRY_SETTINGS['models']['rainfall']

TRIGGER_RP_COLNAME = COUNTRY_SETTINGS['trigger_colname']
TRIGGER_LEVELS = {
    "minimum": 0.6,
    "medium": 0.7,
    "maximum": 0.8
}

EXPOSURE_DATA_SOURCES = COUNTRY_SETTINGS['EXPOSURE_DATA_SOURCES']

#################
## DB SETTINGS ##
#################
SCHEMA_NAME_INPUT = 'IBF-static-input'
SCHEMA_NAME = 'IBF-pipeline-output'
# Other connection-settings in secrets.py

###################
## PATH SETTINGS ##
###################
# GEOSERVER_DATA = '../geoserver/geodata/zambia/'
GEOSERVER_DATA = '/home/pphung/Rainfall-only-trigger/shapes/egy/' ## Phuoc's Egypt test
GEOSERVER_INPUT = GEOSERVER_DATA + 'input/'
GEOSERVER_OUTPUT = GEOSERVER_DATA + 'output/'
# PIPELINE_DATA = 'data/'
PIPELINE_DATA = '/home/pphung/Rainfall-only-trigger/'
PIPELINE_INPUT = PIPELINE_DATA + 'input/'
PIPELINE_OUTPUT = PIPELINE_DATA + 'output/'
PIPELINE_TEMP = PIPELINE_DATA + 'temp/'

WATERSTATIONS_TRIGGERS = PIPELINE_INPUT + COUNTRY_SETTINGS['trigger_levels']
DISTRICT_MAPPING = PIPELINE_INPUT + COUNTRY_SETTINGS['district_mapping']
VECTOR_DISTRICT_DATA = PIPELINE_INPUT + COUNTRY_SETTINGS['flood_extent_admin_boundaries']
EXPOSURE_BOUNDARY_DATA = PIPELINE_INPUT + COUNTRY_SETTINGS['exposure_admin_boundaries']
ADMIN_BOUNDARIES = PIPELINE_INPUT + COUNTRY_SETTINGS['admin_boundaries']
    

#########################
## INPUT DATA SETTINGS ##
#########################

# Glofas input
GLOFAS_FTP = 'data-portal.ecmwf.int/ZambiaRedcross_glofas_point/'
GLOFAS_FILENAME = 'glofas_pointdata_ZambiaRedcross'

# GFS rainfall input
GFS_SOURCE = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'

# CRA input
CRA_FILENAME = COUNTRY_SETTINGS['CRA_filename'] ## Phuoc's Egypt test

####################
## EMAIL SETTINGS ##
####################

# Notification email
EMAIL_NOTIFICATION = False
EMAIL_WITHOUT_TRIGGER = False

# Notification email (only if hard-coded alternative for mailchimp is used)
EMAIL_LIST_HARDCODE = [
    'jannisvisser@redcross.nl'
]

# Logging email settings
LOGGING = False  # If false send email on error
LOGGLY_LINK = "https://rodekruis.loggly.com/"
FROM_EMAIL = "support@510.global"
FROM_EMAIL_NAME = 'FBF Zambia Flood Trigger system'
EMAIL_USERNAME = "sa_typhoon@redcross.nl" #"510.global.dashboards@gmail.com"
LOGGING_TO_EMAIL_ADDRRESSES = [
    "JannisVisser@redcross.nl"
]


