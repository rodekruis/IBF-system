import psycopg2
from psycopg2 import sql as psql
from sqlalchemy import create_engine, text
import pandas as pd

from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db
from settings import SCHEMA_NAME, PIPELINE_OUTPUT, CURRENT_DATE, CALCULATE_EXPOSURE, CRA_FILENAME, COUNTRY_CODE
from secrets import DB_SETTINGS

class DatabaseManager:

    """ Class to upload and process data in the database """

    def __init__(self, fcStep):
        #Create connections (in 2 different ways for now)
        self.engine = create_engine('postgresql://'+DB_SETTINGS['user']+':'+DB_SETTINGS['password']+'@'+DB_SETTINGS['host']+':'+DB_SETTINGS['port']+'/'+DB_SETTINGS['db'])
        triggerFolder = PIPELINE_OUTPUT + "triggers_rp_per_station/"
        affectedFolder = PIPELINE_OUTPUT + "calculated_affected/"
        lizardFolder = PIPELINE_OUTPUT + "lizard/"
        self.tableJson = {
            "triggers_rp_per_station_" + fcStep: triggerFolder + 'triggers_rp_' + fcStep + '_' + COUNTRY_CODE + ".json"
            #,"lizard_output": lizardFolder + 'lizard_output.json'
        }
        if CALCULATE_EXPOSURE:
            self.tableJson["calculated_affected_" + fcStep] = affectedFolder + 'affected_' + fcStep + '_' + COUNTRY_CODE + ".json"

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
        df['country_code']=COUNTRY_CODE

        #Delete existing entries with same date
        try:
            self.con, self.cur, self.db = get_db()
            sql = "DELETE FROM \""+SCHEMA_NAME+"\"."+table+" WHERE date=\'"+current_date+"\' AND country_code=\'"+COUNTRY_CODE+"\'"
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
        if CALCULATE_EXPOSURE:
            sql_file = open('lib/cronJob/processDynamicDataPostgresExposure.sql', 'r', encoding='utf-8')
            sql_exposure = sql_file.read()
            sql_file.close()
        try:
            self.con, self.cur, self.db = get_db()
            self.cur.execute(sql_trigger)
            if CALCULATE_EXPOSURE:
                self.cur.execute(psql.SQL(sql_exposure).format(
                    psql.Identifier("IBF-static-input", CRA_FILENAME + "_3"),
                    psql.Identifier("IBF-static-input", CRA_FILENAME + "_2"),
                    psql.Identifier("IBF-static-input", CRA_FILENAME + "_1")))
            self.con.commit()
            self.con.close()
            print('SQL EXECUTED')
        except psycopg2.ProgrammingError as e:
            logger.info(e)
            print('SQL FAILED', e)



    