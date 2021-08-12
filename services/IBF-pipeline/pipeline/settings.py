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
        },
        'bounding_box': [-9, 21, -18, 34],
        'email': {
            'logo': "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/35e3a47b-65d0-9b15-ad8f-ac19300ef5b6.png",
            'triggerStatement': "TBD",
            'linkDashboard': os.getenv('DASHBOARD_URL'),
            'linkEAPSOP': "https://adore.ifrc.org/Download.aspx?FileId=357745",
            'linkVideo': "https://www.youtube-nocookie.com/embed/q_xTy9PpCcE",
            'linkPdf':  "https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?docid=099a8b8007d1c42ad9fb8d46ddfc76312&authkey=AQfJjA-3U7NeXqnWxJIgsbs&expiration=2022-07-19T22%3A00%3A00.000Z&e=12vFWG",
            'linkSocialMedia': {
                "type": "WhatsApp",
                "url": "https://chat.whatsapp.com/Ca2QYoYjKhyKm6zaZxOnin/"
            },
            'adminAreaLabel': ['District','Districts']
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
        },
        'bounding_box': [5, 29, -2, 36],
        'email': {
            'logo': "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/c44cb471-0595-454d-aad6-d1050553315f.png",
            'triggerStatement': "URCS will activate this EAP when GloFAS issues a forecast of at least <b>60% probability</b> (based on the different ensemble runs) <b>of a 5-year return period</b> flood occurring in flood prone districts, which will be anticipated to affect <b>more than 1,000hh</b>. The EAP will be triggered with a <b>lead time of 7 days</b> and a FAR of <b>not more than 0.5.</b>",
            'linkDashboard': os.getenv('DASHBOARD_URL'),
            'linkEAPSOP': "https://docs.google.com/document/d/1z4KfTIF1aJKgx-te8gPY6Scr2FcYR51x",
            'linkVideo': "https://www.youtube-nocookie.com/embed/O3VlrH_pCeo",
            'linkPdf': "https://unstats.un.org/unsd/demographic/sources/census/wphc/Uganda/UGA-2016-05-23.pdf",
            'linkSocialMedia': {
                "type": "WhatsApp",
                "url": "https://chat.whatsapp.com/Jt7jMX3BydCD07MFExLUUs/"
            },
            'adminAreaLabel': ['District','Districts']
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
        },
        'bounding_box': [5, 33, -4, 42],
        'email': {
            'logo': "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/905748b3-7aaf-4b5e-b5b9-516ad6f4105a.png",
            'triggerStatement': "TBD",
            'linkDashboard': os.getenv('DASHBOARD_URL'),
            'linkEAPSOP': "https://docs.google.com/document/d/1nEfCDx0aV0yBebIjeGHalXMAVUNM8XgR/",
            'linkVideo': "",
            'linkPdf': "",
            'linkSocialMedia': {
                "type": "WhatsApp",
                "url": "https://chat.whatsapp.com/EbJ5kjSNlK018vkYwt5v5K/"
            },
            'adminAreaLabel': ['County','Counties']
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
        },
        'bounding_box': [15, 32, 3, 48],
        'email': {
            'logo': "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/eedbd97e-52c1-4a16-8155-9b607ad05ad2.png",
            'triggerStatement': "TBD",
            'linkDashboard': os.getenv('DASHBOARD_URL'),
            'linkEAPSOP': "https://docs.google.com/document/d/1IQy_1pWvoT50o0ykjJTUclVrAedlHnkwj6QC7gXvk98/",
            'linkVideo': "",
            'linkPdf': "",
            'linkSocialMedia': {
                "type": "WhatsApp",
                "url": "https://chat.whatsapp.com/Ibj8FcZwFxQLBcuMGUkrms/"
            },
            'adminAreaLabel': ['Zone','Zones']
        }
    },
    "EGY": {
        "model": 'rainfall',
        'admin_level': 1,
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
        },
        'email': {
            'logo': "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/6907dc6e-311a-402b-b97d-551f04ef3d0b.png",
            'triggerStatement': "Egyptian RCS can respond accordingly to their EAP/ SOP when the rainfall forecast from Global \
                Forecast System for the lead times of 3- or 5- or 7 days exceeds the defined thresholds, \
                which will be anticipated to occur in some regions of Egypt. The defined threshold \
                corresponds to a 5-year return period heavy rainfall event.",
            'linkDashboard': os.getenv('DASHBOARD_URL'),
            'linkEAPSOP': "https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?docid=07f11e3484d5241c58158cdd420e6134f&authkey=AVPI5OX8vf6JaBSLf2wX_xM&expiration=2022-04-08T22%3A00%3A00.000Z&e=nMtlu2",
            'linkVideo': "",
            'linkPdf': "",
            'linkSocialMedia': {
                "type": "Telegram",
                "url": "https://t.me/joinchat/hLtvficJO-llZDE0/"
            },
            'adminAreaLabel': ['Governorate','Governorates']
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

##################
## API SETTINGS ##
##################

API_SERVICE_URL = 'http://ibf-api-service:3000/api/'
API_LOGIN_URL = API_SERVICE_URL + 'user/login'

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
GLOFAS_FTP = 'data-portal.ecmwf.int/3.1/ZambiaRedcross_glofas_point/'
GLOFAS_FILENAME = 'glofas_pointdata_ZambiaRedcross'

# GFS rainfall input
GFS_SOURCE = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'

####################
## EMAIL SETTINGS ##
####################

# Notification email
EMAIL_WITHOUT_TRIGGER = False

# Logging email settings
LOGGING = False  # If false send email on error
LOGGLY_LINK = "https://rodekruis.loggly.com/"
FROM_EMAIL = "support@510.global"
FROM_EMAIL_NAME = 'IBF Flood Trigger system'
EMAIL_USERNAME = "sa_typhoon@redcross.nl" #"510.global.dashboards@gmail.com"
LOGGING_TO_EMAIL_ADDRRESSES = [
    "JannisVisser@redcross.nl"
]


#####################
## ATTRIBUTE NAMES ##
#####################

TRIGGER_LEVEL = 'triggerLevel'
LEAD_TIME = 'leadTime'
