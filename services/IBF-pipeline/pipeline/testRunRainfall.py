from lib.cronJob.forecast import Forecast
from lib.logging.logglySetup import logger
import traceback
import time
import datetime
from settings import *

def main():
    logger.info('Started Test')
    startTime = time.time()
    print(str(datetime.datetime.now()))

    try:
        for fcStep, days in LEAD_TIMES.items():
            fc = Forecast(fcStep, days)
            fc.rainfallData.process()
    except Exception as e:
        # If a fatal exception occurs during the cronjob
        # logs full stack trace and sends email
        logger.exception("Fatal error occured during the process")
        traceback.print_exc()

    elapsedTime = str(time.time() - startTime)
    print(elapsedTime)
    logger.info('Finished Test in seconds %s', elapsedTime)


if __name__ == '__main__':
    main()