from lib.pipeline.forecast import Forecast
import traceback
import time
import datetime
from settings import *
from secrets import *
import resource


def main():
    soft_limit,hard_limit = resource.getrlimit(resource.RLIMIT_NOFILE)
    resource.setrlimit(resource.RLIMIT_NOFILE, (SOFT_LIMIT, hard_limit))

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
                              COUNTRY_SETTINGS['admin_level'])
                fc.rainfallData.process()
                fc.exposure.callAllExposure()
                fc.db.upload()
                fc.db.sendNotification()

    except Exception as e:
        print(e)

    elapsedTime = str(time.time() - startTime)
    print(elapsedTime)

if __name__ == "__main__":
    main()
