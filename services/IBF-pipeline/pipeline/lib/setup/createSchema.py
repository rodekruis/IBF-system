import psycopg2
from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db
from settings import *


def createSchema():
    con, cur, db = get_db()
    try:
        cur.execute("CREATE SCHEMA IF NOT EXISTS " + SCHEMA_NAME_INPUT)
        con.commit()
    except psycopg2.ProgrammingError as e:
        logger.info(e)
    