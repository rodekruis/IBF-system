import psycopg2
from lib.logging.logglySetup import logger
from lib.setup.setupConnection  import get_db


def getFloodInfo(countryCodeISO3):
    con, cur, db = get_db()

    sqlString = '''
        select aa.name,population_affected,aad."leadTime" as lead_time
            , case when gst."forecastProbability">=0.8 then 'Maximum alert' when gst."forecastProbability">=0.7 then 'Medium alert' when gst."forecastProbability">=0.6 then 'Minimum alert' else '' end as fc_prob
        from (
            select "countryCodeISO3"
                ,"placeCode" 
                ,"leadTime"
                ,value as population_affected
            from "IBF-app"."admin-area-dynamic-data"
            where date = current_date 
            and indicator = 'population_affected'
            and value > 0
        ) aad
        left join "IBF-app"."admin-area" aa 
            on aad."placeCode" = aa."placeCode" 
        left join "IBF-app"."glofas-station" gs
            on aa."glofasStation" = gs."stationCode" 
        left join "IBF-app"."glofas-station-forecast" gst 
            on gs.id = gst."glofasStationId" 
            and gst.date = current_date
            and aad."leadTime" = gst."leadTime"
        where aad."countryCodeISO3" = \'''' + countryCodeISO3 + '''\'
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
