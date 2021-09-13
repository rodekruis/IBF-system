import pandas as pd
import requests
import json
from settings import *
from secrets import *


class DatabaseManager:

    """ Class to upload and process data in the database """

    def __init__(self, leadTimeLabel, countryCodeISO3):
        self.countryCodeISO3 = countryCodeISO3
        self.leadTimeLabel = leadTimeLabel
        self.triggerFolder = PIPELINE_OUTPUT + "triggers_rp_per_station/"
        self.affectedFolder = PIPELINE_OUTPUT + "calculated_affected/"
        self.EXPOSURE_DATA_SOURCES = SETTINGS[countryCodeISO3]['EXPOSURE_DATA_SOURCES']

    def upload(self):
        self.uploadCalculatedAffected()
        self.uploadRasterFile()
    
    def sendNotification(self):
        leadTimes = SETTINGS[self.countryCodeISO3]['lead_times']
        max_leadTime = max(leadTimes, key=leadTimes.get)

        if SETTINGS_SECRET[self.countryCodeISO3]["notify_email"] and self.leadTimeLabel == max_leadTime:
            body = {
                'countryCodeISO3': self.countryCodeISO3,
                'disasterType': self.getDisasterType()
            } 
            self.apiPostRequest('notification/send', body=body)

    
    def getDisasterType(self):
        disasterType = 'heavy-rain'
        return disasterType

    def uploadCalculatedAffected(self):
        for indicator, values in self.EXPOSURE_DATA_SOURCES.items():
            with open(self.affectedFolder +
                      'affected_' + self.leadTimeLabel + '_' + self.countryCodeISO3 + '_' + indicator + '.json') as json_file:
                body = json.load(json_file)
                body['disasterType'] = self.getDisasterType()
                self.apiPostRequest('admin-area-dynamic-data/exposure', body=body)
            print('Uploaded calculated_affected for indicator: ' + indicator)
            if indicator == 'population':
                with open(self.affectedFolder +
                        'affected_' + self.leadTimeLabel + '_' + self.countryCodeISO3 + '_' + 'population_affected_percentage' + '.json') as json_file:
                    body = json.load(json_file)
                    body['disasterType'] = self.getDisasterType()
                    self.apiPostRequest('admin-area-dynamic-data/exposure', body=body)
                print('Uploaded calculated_affected for indicator: ' + 'population_affected_percentage')

    def uploadRasterFile(self):
        disasterType = self.getDisasterType()
        rasterFile = RASTER_OUTPUT + '0/rainfall_extents/rain_rp_' + self.leadTimeLabel + '_' + self.countryCodeISO3 + '.tif'
        files = {'file': open(rasterFile,'rb')}
        self.apiPostRequest('admin-area-dynamic-data/raster/' + disasterType, files=files)
        print('Uploaded raster-file: ' + rasterFile)

    def apiGetRequest(self, path, countryCodeISO3):
        TOKEN = self.apiAuthenticate()

        response = requests.get(
            API_SERVICE_URL + path + '/' + countryCodeISO3,
            headers={'Authorization': 'Bearer ' + TOKEN}
        )
        data = response.json()
        return(data)

    def apiPostRequest(self, path, body=None, files=None):
        TOKEN = self.apiAuthenticate()

        if body != None:
            headers={'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        elif files != None:
            headers={'Authorization': 'Bearer ' + TOKEN}

        r = requests.post(
            API_SERVICE_URL + path,
            json=body,
            files=files,
            headers=headers
        )
        if r.status_code >= 400:
            print(r.text)
            raise ValueError()

    def apiAuthenticate(self):
        login_response = requests.post(API_LOGIN_URL, data=[(
            'email', ADMIN_LOGIN), ('password', ADMIN_PASSWORD)])
        return login_response.json()['user']['token']

    def getDataFromDatalake(self, path):
        import requests
        import datetime
        import hmac
        import hashlib
        import base64

        request_time = datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
        file_system_name = 'ibf/' + path
        print('Downloading from datalake: ', file_system_name)

        string_params = {
            'verb': 'GET',
            'Content-Encoding': '',
            'Content-Language': '',
            'Content-Length': '',
            'Content-MD5': '',
            'Content-Type': '',
            'Date': '',
            'If-Modified-Since': '',
            'If-Match': '',
            'If-None-Match': '',
            'If-Unmodified-Since': '',
            'Range': '',
            'CanonicalizedHeaders': 'x-ms-date:' + request_time + '\nx-ms-version:' + DATALAKE_API_VERSION,
            'CanonicalizedResource': '/' + DATALAKE_STORAGE_ACCOUNT_NAME+'/'+file_system_name
        }

        string_to_sign = (string_params['verb'] + '\n'
                          + string_params['Content-Encoding'] + '\n'
                          + string_params['Content-Language'] + '\n'
                          + string_params['Content-Length'] + '\n'
                          + string_params['Content-MD5'] + '\n'
                          + string_params['Content-Type'] + '\n'
                          + string_params['Date'] + '\n'
                          + string_params['If-Modified-Since'] + '\n'
                          + string_params['If-Match'] + '\n'
                          + string_params['If-None-Match'] + '\n'
                          + string_params['If-Unmodified-Since'] + '\n'
                          + string_params['Range'] + '\n'
                          + string_params['CanonicalizedHeaders']+'\n'
                          + string_params['CanonicalizedResource'])

        signed_string = base64.b64encode(hmac.new(base64.b64decode(
            DATALAKE_STORAGE_ACCOUNT_KEY), msg=string_to_sign.encode('utf-8'), digestmod=hashlib.sha256).digest()).decode()
        headers = {
            'x-ms-date': request_time,
            'x-ms-version': DATALAKE_API_VERSION,
            'Authorization': ('SharedKey ' + DATALAKE_STORAGE_ACCOUNT_NAME + ':' + signed_string)
        }
        url = ('https://' + DATALAKE_STORAGE_ACCOUNT_NAME +
               '.dfs.core.windows.net/'+file_system_name)
        r = requests.get(url, headers=headers)
        return r
