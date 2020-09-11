from lib.cronJob.forecast import Forecast
from lib.cronJob.storeHistoric import storeHistoric 
from lib.notifications.notify import notify 
from lib.logging.logglySetup import logger
import traceback
import time
import datetime
from settings import *

def main():
    logger.info('Started Cron') 
    startTime = time.time()
    print(str(datetime.datetime.now()))

    try:
        if RUN_GLOFAS:
            storeHistoric()
        for fcStep, days in LEAD_TIMES.items():
            fc = Forecast(fcStep, days)
            if RUN_GLOFAS:
                fc.glofasData.process()
            if RUN_RAINFALL:
                fc.rainfallData.process()
            if CALCULATE_EXTENT:
                fc.floodExtent.calculate()
            if CALCULATE_EXTENT and CALCULATE_EXPOSURE:
                fc.floodExtent.callAllExposure()
            fc.db.upload()
        fc.db.processDynamicDataDb()
        notify(COUNTRY_CODE)

    except Exception as e:
        # If a fatal exception occurs during the cronjob 
        # logs full stack trace and sends email
        logger.exception("Fatal error occured during the process")
        traceback.print_exc()

    elapsedTime = str(time.time() - startTime)
    print(elapsedTime)
    logger.info('Finished Cron in seconds %s', elapsedTime)


if __name__ == '__main__':
    main()