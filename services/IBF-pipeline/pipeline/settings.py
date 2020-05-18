from datetime import date, timedelta

###################
## MAIN SETTINGS ##
###################

# Change this date only in case of testing
CURRENT_DATE=date.today()
# CURRENT_DATE=date.today() - timedelta(days=1)

FORECASTS_STEPS = {
    "short": 3,
    "long": 7
}

TRIGGER_RP_COLNAME = '10yr_threshold'
TRIGGER_LEVELS = {
    "minimum": 0.6,
    "medium": 0.7,
    "maximum": 0.8
}

# Datasetname : multiplication-factor
EXPOSURE_DATA_SOURCES = {
    # value of pixel (0-100) reflects no. of cropland pixels in original crop-layer, where each pixel stands for 0.02x0.02=0.0004 km2
    "cropland/crop_resampled": 0.0004,
    "population/hrsl_zmb_pop_100_sum": 1,
    "livestock/Chicken": 1,
    "livestock/Cattle": 1,
    "livestock/Goat": 1,
    "livestock/Pig": 1,
    "livestock/Sheep": 1,
}

#################
## DB SETTINGS ##
#################
LOCAL_DB = True
SCHEMA_NAME = 'IBF-pipeline-output'
# Other connection-settings in secrets.py

###################
## PATH SETTINGS ##
###################
GEOSERVER_DATA = '../geoserver/geodata/zambia/'
GEOSERVER_INPUT = GEOSERVER_DATA + 'input/'
GEOSERVER_OUTPUT = GEOSERVER_DATA + 'output/'
PIPELINE_DATA = 'data/'
PIPELINE_INPUT = PIPELINE_DATA + 'input/'
PIPELINE_OUTPUT = PIPELINE_DATA + 'output/'
PIPELINE_TEMP = PIPELINE_DATA + 'temp/'

WATERSTATIONS_TRIGGERS = PIPELINE_INPUT + \
    "Glofas_station_locations_with_trigger_levels.csv"
VECTOR_DISTRICT_DATA = PIPELINE_DATA + 'input/vector/ZMB_adm2_mapshaper_new103_pcode.shp'
DISTRICT_MAPPING = PIPELINE_DATA+'input/Glofas_station_per_district.csv'

    

#########################
## INPUT DATA SETTINGS ##
#########################

# Glofas input
GLOFAS_FTP = 'data-portal.ecmwf.int/ZambiaRedcross_glofas_point/'
GLOFAS_DUMMY = False
OVERWRITE_DUMMY = False

####################
## EMAIL SETTINGS ##
####################

# Notification email
EMAIL_NOTIFICATION = True
EMAIL_WITHOUT_TRIGGER = True

# Notification email (only if hard-coded alternative for mailchimp is used)
EMAIL_LIST_HARDCODE = [
    'jannisvisser@redcross.nl'
]

# Logging email settings
LOGGING = True  # If false send email on error
LOGGLY_LINK = "https://rodekruis.loggly.com/"
FROM_EMAIL = "support@510.global"
FROM_EMAIL_NAME = 'FBF Zambia Flood Trigger system'
EMAIL_USERNAME = "sa_typhoon@redcross.nl" #"510.global.dashboards@gmail.com"
LOGGING_TO_EMAIL_ADDRRESSES = [
    "JannisVisser@redcross.nl"
]


