import psycopg2
from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db


def getFloodInfo():
    con, cur, db = get_db()

    sqlString = '''
        select
            t1.name
            ,population_affected
            ,lead_time
            ,case when fc_prob>=0.8 then 'Maximum alert' when fc_prob>=0.7 then 'Medium alert' when fc_prob>=0.6 then 'Minimum alert' end as fc_prob
        from
            "IBF-pipeline-output".data_adm2 t0
        left join "IBF-static-input"."ZMB_Geo_level2" t1 on
            t0.pcode = t1.pcode_level2
        where
            current_prev = 'Current'
            and fc_trigger = 1
        order by population_affected desc
    '''

    try:
        cur.execute(sqlString)
        con.commit()
    except psycopg2.ProgrammingError as e:
        logger.info(e)
    
    if cur.statusmessage=='SELECT 0':
        theData = []
    else:
        theData = cur.fetchall()

    isFlood = len(theData) > 0
    theInfo = {
        "flood": isFlood,
        "data": theData
    }
    return theInfo
