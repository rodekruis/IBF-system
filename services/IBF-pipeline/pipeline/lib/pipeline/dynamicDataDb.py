import psycopg2
from psycopg2 import sql as psql
from sqlalchemy import create_engine, text
import pandas as pd
import geopandas as gpd
import requests
import json

from lib.logging.logglySetup import logger
from lib.setup.setupConnection import get_db
from settings import *
from secrets import DB_SETTINGS, ADMIN_LOGIN, ADMIN_PASSWORD, DATALAKE_STORAGE_ACCOUNT_NAME, DATALAKE_STORAGE_ACCOUNT_KEY, DATALAKE_API_VERSION


class DatabaseManager:

    """ Class to upload and process data in the database """

    def __init__(self, leadTimeLabel, country_code):
        self.country_code = country_code
        self.leadTimeLabel = leadTimeLabel
        self.engine = create_engine(
            'postgresql://'+DB_SETTINGS['user']+':'+DB_SETTINGS['password']+'@'+DB_SETTINGS['host']+':'+DB_SETTINGS['port']+'/'+DB_SETTINGS['db'])
        self.triggerFolder = PIPELINE_OUTPUT + "triggers_rp_per_station/"
        self.affectedFolder = PIPELINE_OUTPUT + "calculated_affected/"
        self.EXPOSURE_DATA_SOURCES = SETTINGS[country_code]['EXPOSURE_DATA_SOURCES']

    def upload(self):
        if SETTINGS[self.country_code]['model'] == 'glofas':
            self.uploadTriggersPerLeadTime()
            self.uploadTriggerPerStation()
        self.uploadCalculatedAffected()

    def uploadCalculatedAffected(self):
        for indicator, values in self.EXPOSURE_DATA_SOURCES.items():
            with open(self.affectedFolder + \
                'affected_' + self.leadTimeLabel + '_' + self.country_code + '_' + indicator + '.json') as json_file:
                body = json.load(json_file)
                self.apiPostRequest('upload/exposure', body)
            print('Uploaded calculated_affected for indicator: ' + indicator)

    def uploadTriggerPerStation(self):
        df = pd.read_json(self.triggerFolder + \
                'triggers_rp_' + self.leadTimeLabel + '_' + self.country_code + ".json", orient='records')
        dfUpload = pd.DataFrame(index=df.index)
        dfUpload['countryCode'] = self.country_code
        dfUpload['leadTime'] = self.leadTimeLabel
        dfUpload['stationCode'] = df['stationCode']
        dfUpload['forecastLevel'] = df['fc']
        dfUpload['forecastProbability'] = df['fc_prob']
        dfUpload['forecastTrigger'] = df['fc_trigger']
        dfUpload['forecastReturnPeriod'] = df['fc_rp']
        body = json.loads(dfUpload.to_json(orient='records'))
        self.apiPostRequest('glofasStations/triggers', body)
        print('Uploaded triggers per station')

    def uploadTriggersPerLeadTime(self):
        with open(self.triggerFolder + \
            'trigger_per_day_' + self.country_code + ".json") as json_file:
            triggers = json.load(json_file)[0]
            for key in triggers:
                body = {
                    'countryCode': self.country_code,
                    'leadTime': str(key),
                    'triggered': triggers[key]
                }
                self.apiPostRequest('upload/triggers-per-leadtime', body)
        print('Uploaded triggers per leadTime')

    def processDynamicDataDb(self):
        sql_file = open(
            'lib/pipeline/processDynamicDataPostgresTrigger.sql', 'r', encoding='utf-8')
        sql_trigger = sql_file.read()
        sql_file.close()
        sql_file = open(
            'lib/pipeline/processDynamicDataPostgresExposure.sql', 'r', encoding='utf-8')
        sql_exposure = sql_file.read()
        sql_file.close()
        sql_file = open('lib/pipeline/processEventDistricts.sql',
                        'r', encoding='utf-8')
        sql_event_districts = sql_file.read()
        sql_file.close()
        sql_file = open('lib/pipeline/createApiViews.sql',
                        'r', encoding='utf-8')
        sql_create_views = sql_file.read()
        sql_file.close()
        try:
            self.con, self.cur, self.db = get_db()
            self.cur.execute(sql_trigger)
            self.cur.execute(sql_exposure)
            self.cur.execute(sql_event_districts)
            self.cur.execute(sql_create_views)
            self.con.commit()
            self.con.close()
            print('SQL EXECUTED')
        except psycopg2.ProgrammingError as e:
            logger.info(e)
            print('SQL FAILED', e)

    def apiGetRequest(self, path, country_code):
        TOKEN = self.authenticate()

        response = requests.get( \
            API_SERVICE_URL + path + '/' + country_code, \
            headers={'Authorization': 'Bearer ' + TOKEN} \
            )
        data = response.json()
        return(data)

    def apiPostRequest(self, path, body):
        TOKEN = self.authenticate()

        r = requests.post( \
            API_SERVICE_URL + path, \
            json = body, \
            headers={'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'Accept':'application/json'} \
        )
        if r.status_code >= 400:
            print(r.text)
            raise ValueError()

    def authenticate(self):
        login_response = requests.post(API_LOGIN_URL, data=[('email',ADMIN_LOGIN),('password',ADMIN_PASSWORD)])
        return login_response.json()['user']['token']

    def downloadGeoDataFromDb(self, schema, table, country_code=None):
        try:
            self.con, self.cur, self.db = get_db()
            sql = "SELECT * FROM \""+schema+"\".\""+table+"\""
            if country_code != None:
                sql = sql + " WHERE \"countryCode\"=\'"+self.country_code+"\'"
            admin_gdf = gpd.read_postgis(sql, self.con)
        except psycopg2.ProgrammingError as e:
            logger.info(e)

        return admin_gdf
    
    def getDataFromDatalake(self, path):
        import requests
        import datetime
        import hmac
        import hashlib
        import base64

        
        request_time = datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
        file_system_name ='ibf/' + path
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
        
        signed_string = base64.b64encode(hmac.new(base64.b64decode(DATALAKE_STORAGE_ACCOUNT_KEY), msg=string_to_sign.encode('utf-8'), digestmod=hashlib.sha256).digest()).decode()
        headers = {
            'x-ms-date' : request_time,
            'x-ms-version' : DATALAKE_API_VERSION,
            'Authorization' : ('SharedKey ' + DATALAKE_STORAGE_ACCOUNT_NAME + ':' + signed_string)
        }
        url = ('https://' + DATALAKE_STORAGE_ACCOUNT_NAME + '.dfs.core.windows.net/'+file_system_name)
        r = requests.get(url, headers = headers)
        return r
