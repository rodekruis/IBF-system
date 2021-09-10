import psycopg2
import sys
from secrets import DB_SETTINGS
from settings import *

con = cur = db = None


def connect():
    global con, cur
    try:
        con = psycopg2.connect(("dbname='"+DB_SETTINGS['db']+"' user='"+DB_SETTINGS['user']+"' password='"+ DB_SETTINGS['password']+ "' host='"+DB_SETTINGS['host']+"' port='"+DB_SETTINGS['port']+"'"))
        con.autocommit = True
        cur = con.cursor()
        db = cur.execute
    except psycopg2.OperationalError as e:
        if con:
             con.rollback()
        sys.exit



def get_db():
    if not (con and cur and db):
        connect()
    return (con, cur, db)