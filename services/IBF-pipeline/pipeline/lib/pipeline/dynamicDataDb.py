import psycopg2
from psycopg2 import sql as psql
from sqlalchemy import create_engine, text
import pandas as pd
import geopandas as gpd

from lib.logging.logglySetup import logger
from lib.setup.setupConnection import get_db
from settings import *
from secrets import DB_SETTINGS, ADMIN_LOGIN, ADMIN_PASSWORD


class DatabaseManager:

    """ Class to upload and process data in the database """

    def __init__(self, leadTimeLabel, country_code):
        self.country_code = country_code
        self.leadTimeLabel = leadTimeLabel
        # Create connections (in 2 different ways for now)
        self.engine = create_engine(
            'postgresql://'+DB_SETTINGS['user']+':'+DB_SETTINGS['password']+'@'+DB_SETTINGS['host']+':'+DB_SETTINGS['port']+'/'+DB_SETTINGS['db'])
        triggerFolder = PIPELINE_OUTPUT + "triggers_rp_per_station/"
        affectedFolder = PIPELINE_OUTPUT + "calculated_affected/"

        self.tableJson = {}
        if SETTINGS[country_code]['model'] == 'glofas':
            self.tableJson["triggers_rp_per_station"] = triggerFolder + \
                'triggers_rp_' + leadTimeLabel + '_' + country_code + ".json"
            self.tableJson["triggers_per_day"] = triggerFolder + \
                'trigger_per_day_' + country_code + ".json"
        self.tableJson["calculated_affected"] = affectedFolder + \
            'affected_' + leadTimeLabel + '_' + country_code + ".json"

    def upload(self):
        for table, jsonData in self.tableJson.items():
            self.uploadDynamicToDb(table, jsonData)

    def uploadDynamicToDb(self, table, jsonData):

        logger.info("Uploading from %s to %s", table, jsonData)
        df = pd.read_json(jsonData, orient='records')
        current_date = CURRENT_DATE.strftime('%Y-%m-%d')
        df['date'] = CURRENT_DATE
        df['country_code'] = self.country_code
        if table != "triggers_per_day":
            df['lead_time'] = self.leadTimeLabel

        # Delete existing entries with same date, lead_time and country_code
        try:
            self.con, self.cur, self.db = get_db()
            sql = "DELETE FROM \""+SCHEMA_NAME+"\"."+table+" WHERE date=\'" + \
                current_date+"\' AND country_code=\'"+self.country_code+"\'"
            if table != "triggers_per_day":
                sql = sql + " AND lead_time=\'"+self.leadTimeLabel+"\'"
            self.cur.execute(sql)
            self.con.commit()
            self.con.close()
        except psycopg2.ProgrammingError as e:
            logger.info(e)

        # Append new data for current date, lead_time and country_code
        df.to_sql(table, self.engine, if_exists='append', schema=SCHEMA_NAME)
        print(table+' uploaded')

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
        try:
            self.con, self.cur, self.db = get_db()
            self.cur.execute(sql_trigger)
            self.cur.execute(sql_exposure)
            self.cur.execute(sql_event_districts)
            self.con.commit()
            self.con.close()
            print('SQL EXECUTED')
        except psycopg2.ProgrammingError as e:
            logger.info(e)
            print('SQL FAILED', e)

    def apiGetRequest(self, path, country_code):
        import requests

        login_response = requests.post('http://12.0.0.8:3000/api/user/login', data=[('email',ADMIN_LOGIN),('password',ADMIN_PASSWORD)])
        TOKEN = login_response.json()['user']['token']

        response = requests.get('http://12.0.0.8:3000/api/'+path+'/'+country_code,headers={'Authorization': 'Bearer ' + TOKEN})
        data = response.json()
        return(data)

    def downloadGeoDataFromDb(self, schema, table, country_code=None):
        try:
            self.con, self.cur, self.db = get_db()
            sql = "SELECT * FROM \""+schema+"\".\""+table+"\""
            if country_code != None:
                sql = sql + " WHERE \"countryCode\"=\'"+self.country_code+"\'"
            admin_gdf = gpd.read_postgis(sql,self.con)
        except psycopg2.ProgrammingError as e:
            logger.info(e)

        return admin_gdf