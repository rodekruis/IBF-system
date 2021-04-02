import os
from datetime import date, timedelta


##########################
## DEVELOPMENT SETTINGS ##
##########################

# Change dummy-triggers per country (below) now

# Change this date only in case of specific testing purposes
CURRENT_DATE = date.today()
# CURRENT_DATE=date.today() - timedelta(1)


######################
## COUNTRY SETTINGS ##
######################

SETTINGS = {
    "ZMB": {
        "model": 'glofas',
        'redcross_branches': 'points/redcross_branches_ZMB.csv',
        'lead_times': {
            "3-day": 3,
            "7-day": 7
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_zmb_pop_resized_100",
                "rasterValue": 1
            }
        },
        'bounding_box': [-9, 21, -18, 34]
    },
    "UGA": {
        "model": 'glofas',
        'flood_vulnerability': 'Flood_vulnerability_EAP_UGA.csv',
        'redcross_branches': 'points/redcross_branches_UGA.csv',
        'lead_times': {
            "5-day": 5
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_uga_pop_resized_100",
                "rasterValue": 1
            }
        },
        'bounding_box': [5, 29, -2, 36]
    },
    "KEN": {
        "model": 'glofas',
        'lead_times': {
            "7-day": 7
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_ken_pop_resized_100",
                "rasterValue": 1
            }
        },
        'bounding_box': [5, 33, -4, 42]
    },
    "ETH": {
        "model": 'glofas',
        'lead_times': {
            "7-day": 7
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/worldpop_eth",
                "rasterValue": 1
            }
        },
        'bounding_box': [15, 32, 3, 48]
    },
    "EGY": {
        "model": 'rainfall',
        "trigger_levels": 'Rainfall_station_locations_with_trigger_levels.csv',
        'trigger_colname': '5yr_threshold',
        'lead_times': {
            "3-day": 3,
            "5-day": 5,
            "7-day": 7
        },
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_egy_pop_resized_100",
                "rasterValue": 1
            }
        }
    }
}



####################
## OTHER SETTINGS ##
####################

TRIGGER_LEVELS = {
    "minimum": 0.6,
    "medium": 0.7,
    "maximum": 0.8
}

#################
## DB SETTINGS ##
#################
SCHEMA_NAME_INPUT = 'IBF-static-input'
SCHEMA_NAME = 'IBF-pipeline-output'
# Other connection-settings in secrets.py

###################
## PATH SETTINGS ##
###################
GEOSERVER_DATA = 'data/raster/'
GEOSERVER_INPUT = GEOSERVER_DATA + 'input/'
GEOSERVER_OUTPUT = GEOSERVER_DATA + 'output/'
PIPELINE_DATA = 'data/other/'
PIPELINE_INPUT = PIPELINE_DATA + 'input/'
PIPELINE_OUTPUT = PIPELINE_DATA + 'output/'

#########################
## INPUT DATA SETTINGS ##
#########################

# Glofas input
GLOFAS_FTP = 'data-portal.ecmwf.int/ZambiaRedcross_glofas_point/'
GLOFAS_FILENAME = 'glofas_pointdata_ZambiaRedcross'

# GFS rainfall input
GFS_SOURCE = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'

####################
## EMAIL SETTINGS ##
####################

# Notification email
EMAIL_WITHOUT_TRIGGER = False

# Notification email (True if hard-coded alternative for mailchimp is used)
EMAIL_HARDCODE = False
EMAIL_LIST_HARDCODE = [
    'jannisvisser@redcross.nl'
]

# Logging email settings
LOGGING = False  # If false send email on error
LOGGLY_LINK = "https://rodekruis.loggly.com/"
FROM_EMAIL = "support@510.global"
FROM_EMAIL_NAME = 'IBF Flood Trigger system'
EMAIL_USERNAME = "sa_typhoon@redcross.nl" #"510.global.dashboards@gmail.com"
LOGGING_TO_EMAIL_ADDRRESSES = [
    "JannisVisser@redcross.nl"
]


