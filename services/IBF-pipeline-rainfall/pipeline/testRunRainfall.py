from lib.pipeline.forecast import Forecast
import traceback
import time
import datetime
from settings import *

def main():
    startTime = time.time()
    print(str(datetime.datetime.now()))

    try:
        for leadTimeLabel, leadTimeValue in LEAD_TIMES.items():
            fc = Forecast(leadTimeLabel, leadTimeValue)
            fc.rainfallData.process()
    except Exception as e:
        print(e)

    elapsedTime = str(time.time() - startTime)
    print(elapsedTime)


if __name__ == '__main__':
    main()