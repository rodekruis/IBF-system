import psycopg2
from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db


def getFloodInfo(countryCode):
    con, cur, db = get_db()

    sqlString = '''
        select
            t1.name
            ,t0.population_affected
            ,t0.lead_time
            ,case when t0.fc_prob>=0.8 then 'Maximum alert' when t0.fc_prob>=0.7 then 'Medium alert' when t0.fc_prob>=0.6 then 'Minimum alert' end as fc_prob
        from
            "IBF-pipeline-output".data_adm2 t0
        left join (
            select *
            from "IBF-API"."Admin_area_data2"
            union all
            select *
            from "IBF-API"."Admin_area_data1"
        ) t1 on
            t0.pcode = t1.pcode
            and t0.lead_time = t1.lead_time
            and t0.current_prev = t1.current_prev
        where
            t0.country_code = \'''' + countryCode + '''\'
            and t0.current_prev = 'Current'
            and t0.fc_trigger = 1
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
