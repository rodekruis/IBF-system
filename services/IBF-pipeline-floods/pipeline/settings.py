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
        'lead_times': {
            "7-day": 7
        },
        'admin_level': 2,
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_zmb_pop_resized_100",
                "rasterValue": 1
            }
        }
    },
    "UGA": {
        "model": 'glofas',
        'lead_times': {
            "5-day": 5
        },
        'admin_level': 2,
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_uga_pop_resized_100",
                "rasterValue": 1
            }
        }
    },
    "KEN": {
        "model": 'glofas',
        'lead_times': {
            "7-day": 7
        },
        'admin_level': 1,
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/hrsl_ken_pop_resized_100",
                "rasterValue": 1
            }
        }
    },
    "ETH": {
        "model": 'glofas',
        'lead_times': {
            "7-day": 7
        },
        'admin_level': 3,
        'EXPOSURE_DATA_SOURCES': {
            "population": {
                "source": "population/worldpop_eth",
                "rasterValue": 1
            }
        }
    }
}



####################
## OTHER SETTINGS ##
####################

# Nr. of max open files, when pipeline is ran from cronjob.
# Should be larger then the nr of admin-areas on the relevant admin-level handled (e.g. 1040 woreda's in ETH)
SOFT_LIMIT = 10000

TRIGGER_LEVELS = {
    "minimum": 0.6,
    "medium": 0.7,
    "maximum": 0.8
}

##################
## API SETTINGS ##
##################

# API_SERVICE_URL = 'http://host.docker.internal:3000/api/'   # 'host.docker.internal' can be used on Windows to access localhost of host machine
API_SERVICE_URL = 'https://ibf-test.510.global/api/'
API_LOGIN_URL = API_SERVICE_URL + 'user/login'

###################
## PATH SETTINGS ##
###################
RASTER_DATA = 'data/raster/'
RASTER_INPUT = RASTER_DATA + 'input/'
RASTER_OUTPUT = RASTER_DATA + 'output/'
PIPELINE_DATA = 'data/other/'
PIPELINE_INPUT = PIPELINE_DATA + 'input/'
PIPELINE_OUTPUT = PIPELINE_DATA + 'output/'

#########################
## INPUT DATA SETTINGS ##
#########################

# Glofas input
GLOFAS_FTP = 'data-portal.ecmwf.int/3.1/ZambiaRedcross_glofas_point/'
GLOFAS_FILENAME = 'glofas_pointdata_ZambiaRedcross'


#####################
## ATTRIBUTE NAMES ##
#####################

TRIGGER_LEVEL = 'triggerLevel'
LEAD_TIME = 'leadTime'
