from lib.pipeline.forecast import Forecast
from lib.notifications.notify import notify
from lib.logging.logglySetup import logger
import traceback
import time
import datetime
from settings import *
from secrets import *
import resource


def main():
    soft_limit,hard_limit = resource.getrlimit(resource.RLIMIT_NOFILE)
    resource.setrlimit(resource.RLIMIT_NOFILE, (SOFT_LIMIT, hard_limit))

    logger.info("Started Cron")
    startTime = time.time()
    print(str(datetime.datetime.now()))

    try:
        for COUNTRY_CODE in COUNTRY_CODES:
            print('--------STARTING: ' + COUNTRY_CODE +
                  '--------------------------')

            COUNTRY_SETTINGS = SETTINGS[COUNTRY_CODE]
            LEAD_TIMES = COUNTRY_SETTINGS['lead_times']

            for leadTimeLabel, leadTimeValue in LEAD_TIMES.items():
                print('--------STARTING: ' + leadTimeLabel +
                      '--------------------------')
                fc = Forecast(leadTimeLabel, leadTimeValue, COUNTRY_CODE,
                              COUNTRY_SETTINGS['model'], COUNTRY_SETTINGS['admin_level'])
                if COUNTRY_SETTINGS['model'] == 'rainfall':
                    fc.rainfallData.process()
                if COUNTRY_SETTINGS['model'] == 'glofas':
                    fc.glofasData.process()
                    fc.floodExtent.calculate()
                fc.exposure.callAllExposure()
                fc.db.upload()
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
