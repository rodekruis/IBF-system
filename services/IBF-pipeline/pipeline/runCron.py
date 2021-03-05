from lib.cronJob.forecast import Forecast
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
        for COUNTRY_CODE in COUNTRY_CODES:
            print('--------STARTING: ' + COUNTRY_CODE +
                  '--------------------------')

            COUNTRY_SETTINGS = SETTINGS[COUNTRY_CODE]
            LEAD_TIMES = COUNTRY_SETTINGS['lead_times']

            for fcStep, days in LEAD_TIMES.items():
                print('--------STARTING: ' + fcStep +
                      '--------------------------')
                fc = Forecast(fcStep, days, COUNTRY_CODE,
                              COUNTRY_SETTINGS['model'])
                if COUNTRY_SETTINGS['model'] == 'rainfall':
                    fc.rainfallData.process()
                if COUNTRY_SETTINGS['model'] == 'glofas':
                    fc.glofasData.process()
                    fc.floodExtent.calculate()
                fc.floodExtent.callAllExposure()
                fc.db.upload()
            fc.db.processDynamicDataDb()
            if COUNTRY_SETTINGS['model'] == 'glofas' and SETTINGS_SECRET[COUNTRY_CODE]["notify_email"]:
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
