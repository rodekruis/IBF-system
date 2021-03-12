import psycopg2
from lib.logging.logglySetup import logger
import pandas as pd
import os.path
from sqlalchemy import create_engine

from lib.setup.setupConnection  import get_db
from settings import *
from secrets import *

def uploadStaticToDb(table, folder_file):

    #Create connections (in 2 different ways for now)
    con, cur, db = get_db()
    engine = create_engine('postgresql://'+DB_SETTINGS['user']+':'+DB_SETTINGS['password']+'@'+DB_SETTINGS['host']+':'+DB_SETTINGS['port']+'/'+DB_SETTINGS['db'])
    
    #Load static data CSV
    path = PIPELINE_DATA+'input/'+folder_file
    extension = os.path.splitext(folder_file)[1]
    if extension == '.csv':
        df = pd.read_csv(path,delimiter=';', encoding='windows-1251')
        if len(df.columns) == 1 :
            df = pd.read_csv(path, delimiter=',', encoding="windows-1251")
    #print(df)

    #Append new data for current date
    df.to_sql(table,engine,if_exists='replace',schema=SCHEMA_NAME_INPUT)
    print(table+' uploaded')