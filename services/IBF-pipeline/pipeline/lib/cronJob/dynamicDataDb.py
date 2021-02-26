import psycopg2
from psycopg2 import sql as psql
from sqlalchemy import create_engine, text
import pandas as pd

from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db
from settings import *
from secrets import DB_SETTINGS

class DatabaseManager:

    """ Class to upload and process data in the database """

    def __init__(self, fcStep, country_code):
        self.country_code = country_code
        #Create connections (in 2 different ways for now)
        self.engine = create_engine('postgresql://'+DB_SETTINGS['user']+':'+DB_SETTINGS['password']+'@'+DB_SETTINGS['host']+':'+DB_SETTINGS['port']+'/'+DB_SETTINGS['db'])
        triggerFolder = PIPELINE_OUTPUT + "triggers_rp_per_station/"
        affectedFolder = PIPELINE_OUTPUT + "calculated_affected/"
        lizardFolder = PIPELINE_OUTPUT + "lizard/"
        self.tableJson = {
            "triggers_rp_per_station_" + fcStep: triggerFolder + 'triggers_rp_' + fcStep + '_' + country_code + ".json"
            ,"triggers_per_day": triggerFolder + 'trigger_per_day_' + country_code + ".json"
        }
        if CALCULATE_EXPOSURE:
            self.tableJson["calculated_affected_" + fcStep] = affectedFolder + 'affected_' + fcStep + '_' + country_code + ".json"

    def upload(self):
        for table, jsonData in self.tableJson.items():
            self.uploadDynamicToDb(table, jsonData)

    def upload_lizard(self):
        table = "lizard_output"
        lizardFolder = PIPELINE_OUTPUT + "lizard/"
        jsonData = lizardFolder + 'lizard_output.json'
        self.uploadDynamicToDb(table, jsonData)


    def uploadDynamicToDb(self, table, jsonData):
        logger.info("Uploading from %s to %s", table, jsonData)
        #Load (static) threshold values per station and add date-column
        df = pd.read_json(jsonData, orient='records')
        current_date = CURRENT_DATE.strftime('%Y-%m-%d')
        df['date']=current_date
        df['country_code']=self.country_code

        #Delete existing entries with same date
        try:
            self.con, self.cur, self.db = get_db()
            sql = "DELETE FROM \""+SCHEMA_NAME+"\"."+table+" WHERE date=\'"+current_date+"\' AND country_code=\'"+self.country_code+"\'"
            self.cur.execute(sql)
            self.con.commit()
            self.con.close()
        except psycopg2.ProgrammingError as e:
            logger.info(e)

        #Append new data for current date
        df.to_sql(table, self.engine, if_exists='append', schema=SCHEMA_NAME)
        print(table+' uploaded')

    def processDynamicDataDb(self):
        sql_file = open('lib/cronJob/processDynamicDataPostgresTrigger.sql', 'r', encoding='utf-8')
        sql_trigger = sql_file.read()
        sql_file.close()
        sql_file = open('lib/cronJob/processEventDistricts.sql', 'r', encoding='utf-8')
        sql_event_districts = sql_file.read()
        sql_file.close()
        sql_file = open('lib/cronJob/processDynamicDataPostgresExposure.sql', 'r', encoding='utf-8')
        sql_exposure = sql_file.read()
        sql_file.close()
        try:
            self.con, self.cur, self.db = get_db()
            self.cur.execute(sql_trigger)
            self.cur.execute(sql_event_districts)
            self.cur.execute(psql.SQL(sql_exposure))
            self.con.commit()
            self.con.close()
            print('SQL EXECUTED')
        except psycopg2.ProgrammingError as e:
            logger.info(e)
            print('SQL FAILED', e)

    def downloadDataFromDb(self, schema, table, country_code = None):
        try:
            self.con, self.cur, self.db = get_db()
            sql = "SELECT * FROM \""+schema+"\".\""+table+"\""
            if country_code != None:
                sql = sql + " WHERE country_code=\'"+self.country_code+"\'"
            self.cur.execute(sql)
            data = self.cur.fetchall()
            self.cur.execute("SELECT * FROM \""+schema+"\".\""+table+"\" LIMIT 0")
            colnames = [desc[0] for desc in self.cur.description]
            self.con.commit()
            self.con.close()
        except psycopg2.ProgrammingError as e:
            logger.info(e)

        return data,colnames



    