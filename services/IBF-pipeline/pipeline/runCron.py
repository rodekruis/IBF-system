from lib.cronJob.forecast import Forecast
from lib.cronJob.storeHistoric import storeHistoric
from lib.notifications.notify import notify
from lib.logging.logglySetup import logger
import traceback
import time
import datetime
from settings import *
from secrets import *

def main():
    logger.info("Started Cron")
    startTime = time.time()
    print(str(datetime.datetime.now()))

    try:
        storeHistoric()
        for COUNTRY_CODE in COUNTRY_CODES:
            print('--------STARTING: ' + COUNTRY_CODE + '--------------------------')

            COUNTRY_SETTINGS = SETTINGS[COUNTRY_CODE]
            LEAD_TIMES = COUNTRY_SETTINGS['lead_times']
            RUN_GLOFAS = COUNTRY_SETTINGS['models']['glofas']
            RUN_RAINFALL = COUNTRY_SETTINGS['models']['rainfall']
            for fcStep, days in LEAD_TIMES.items():
                print('--------STARTING: ' + fcStep + '--------------------------')
                fc = Forecast(fcStep, days, COUNTRY_CODE, COUNTRY_SETTINGS['model'])
                    fc.rainfallData.process()
                if CALCULATE_EXTENT:
                    fc.floodExtent.calculate()
                if CALCULATE_EXTENT and CALCULATE_EXPOSURE:
                    fc.floodExtent.callAllExposure()
                fc.db.upload()
            if COUNTRY_SETTINGS['model'] == 'glofas':
                fc.db.processDynamicDataDb()
                notify(COUNTRY_CODE)

    except Exception as e:
        # If a fatal exception occurs during the cronjob
        # logs full stack trace and sends email
        logger.exception("Fatal error occured during the process")
        traceback.print_exc()

    elapsedTime = str(time.time() - startTime)
    print(elapsedTime)
    logger.info("Finished Cron in seconds %s", elapsedTime)

if __name__ == "__main__":
    main()
