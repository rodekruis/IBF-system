import psycopg2
from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db


def getFloodInfo(countryCodeISO3):
    con, cur, db = get_db()

    sqlString = '''
        select aad.name,population_affected ,lead_time
            , case when gst."forecastProbability">=0.8 then 'Maximum alert' when gst."forecastProbability">=0.7 then 'Medium alert' when gst."forecastProbability">=0.6 then 'Minimum alert' else '' end as fc_prob
        from (
            select *
            from "IBF-API"."Admin_area_data2"
            union all
            select *
            from "IBF-API"."Admin_area_data1"
        ) aad
        left join "IBF-app"."adminArea" aa 
            on aad."placeCode" = aa."placeCode" 
        left join "IBF-app"."glofasStationTrigger" gst 
            on aa."glofasStation" = gst."stationCode" 
            and aad.lead_time = gst."leadTime" 
        where aad.countryCodeISO3 = \'''' + countryCodeISO3 + '''\'
            and aad.population_affected > 0
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
