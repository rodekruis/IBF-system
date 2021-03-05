import netCDF4
import xarray as xr
import os
from os import listdir
from os.path import isfile, join
import pandas as pd
from pandas import DataFrame
import sys
import json
import datetime
import logging
import urllib.request
import urllib.error
import tarfile
import time
from lib.logging.logglySetup import logger
from settings import *
from secrets import GLOFAS_USER, GLOFAS_PW, SETTINGS_SECRET


class GlofasData:

    def __init__(self, fcStep, days, country_code, glofas_stations, glofas_cols, district_mapping, district_cols):
        self.fcStep = fcStep
        self.days = days
        self.country_code = country_code
        self.inputPath = PIPELINE_DATA+'input/glofas/'
        self.triggerPerDay = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/trigger_per_day_' + country_code + '.json'
        self.extractedGlofasPath = PIPELINE_OUTPUT + \
            'glofas_extraction/glofas_forecast_' + \
            self.fcStep + '_' + country_code + '.json'
        self.triggersPerStationPath = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/triggers_rp_' + \
            self.fcStep + '_' + country_code + '.json'
        self.GLOFAS_STATIONS = glofas_stations
        self.glofas_cols = glofas_cols
        self.DISTRICT_MAPPING = district_mapping
        self.district_cols = district_cols

    def process(self):
        self.removeOldGlofasData()
        self.download()
        self.extract()
        self.findTrigger()

    def removeOldGlofasData(self):
        for f in [f for f in os.listdir(self.inputPath)]:
            os.remove(os.path.join(self.inputPath, f))

    def download(self):
        downloadDone = False

        timeToTryDownload = 43200
        timeToRetry = 600

        start = time.time()
        end = start + timeToTryDownload

        while downloadDone == False and time.time() < end:
            try:
                self.makeFtpRequest()
                downloadDone = True
            except urllib.error.URLError:
                logger.info(
                    "Glofas unzip failed, probably because download failed. "
                    "Trying again in 10 minutes")
                time.sleep(timeToRetry)
        if downloadDone == False:
            raise ValueError('GLofas download failed for ' +
                             str(timeToTryDownload/3600) + ' hours, no new dataset was found')

    def makeFtpRequest(self):
        current_date = CURRENT_DATE.strftime('%Y%m%d')
        filename = GLOFAS_FILENAME + '_' + current_date + '00.tar.gz'
        ftp_path = 'ftp://'+GLOFAS_USER+':'+GLOFAS_PW + '@' + GLOFAS_FTP
        urllib.request.urlretrieve(ftp_path + filename,
                                   self.inputPath + filename)

        tar = tarfile.open(self.inputPath + filename, "r:gz")
        tar.extractall(self.inputPath)
        tar.close()

    def extract(self):
        print('\nExtracting Glofas Data\n')

        files = [f for f in listdir(self.inputPath) if isfile(
            join(self.inputPath, f)) and f.endswith('.nc')]

        df_thresholds = DataFrame(self.GLOFAS_STATIONS)
        df_thresholds.columns = self.glofas_cols
        df_thresholds = df_thresholds.set_index("station_code", drop=False)
        df_district_mapping = DataFrame(self.DISTRICT_MAPPING)
        df_district_mapping.columns = self.district_cols
        df_district_mapping = df_district_mapping.set_index(
            "station_code_7day", drop=False)

        stations = []
        trigger_per_day = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
        }
        for i in range(0, len(files)):
            logging.info("Extracting glofas data from %s", i)
            Filename = os.path.join(self.inputPath, files[i])
            station = {}
            station['code'] = files[i].split(
                '_')[2]

            data = xr.open_dataset(Filename)

            # Get threshold for this specific station
            if station['code'] in df_thresholds['station_code'] and station['code'] in df_district_mapping['station_code_7day']:
                print(Filename)
                threshold = df_thresholds[df_thresholds.station_code ==
                                          station['code']]['trigger_level'][0]

                # Set dimension-values
                time = 0

                for step in range(1, 8):

                    # Loop through 51 ensembles, get forecast (for 3 or 7 day) and compare to threshold
                    ensemble_options = 51
                    count = 0
                    dis_sum = 0
                    for ensemble in range(0, ensemble_options):

                        discharge = data['dis'].sel(
                            ensemble=ensemble, step=step).values[time][0]

                        # DUMMY OVERWRITE DEPENDING ON COUNTRY SETTING
                        if SETTINGS_SECRET[self.country_code]['dummy_trigger'] == True:
                            if step < 5:
                                discharge = 0
                            elif station['code'] == 'G1361':  # ZMB dummy flood station 1
                                discharge = 8000
                            elif station['code'] == 'G1328':  # ZMB dummy flood station 2
                                discharge = 9000
                            elif station['code'] == 'G5200':  # UGA dummy flood station
                                discharge = 700
                            elif station['code'] == 'G1067':  # ETH dummy flood station
                                discharge = 1000
                            elif station['code'] == 'G1904':  # ETH dummy flood station
                                discharge = 2000
                            elif station['code'] == 'G5194':  # KEN dummy flood station
                                discharge = 2000
                            else:
                                discharge = 0

                        if discharge >= threshold:
                            count = count + 1
                        dis_sum = dis_sum + discharge

                    prob = count/ensemble_options
                    dis_avg = dis_sum/ensemble_options
                    station['fc'] = dis_avg
                    station['fc_prob'] = prob
                    station['fc_trigger'] = 1 if prob > TRIGGER_LEVELS['minimum'] else 0

                    if station['fc_trigger'] == 1:
                        trigger_per_day[step] = 1

                    if step == self.days:
                        stations.append(station)
                    station = {}
                    station['code'] = files[i].split(
                        '_')[2]

            data.close()

        # Add 'no_station' and all currently unavailable glofas-stations manually for now
        # ,'F0043','F0044','F0045','F0046','F0047','F0048','F0049','F0050','F0051','F0052','F0053','F0054','F0055','F0056','G5696']:
        for station_code in ['no_station']:
            station = {}
            station['code'] = station_code
            station['fc'] = 0
            station['fc_prob'] = 0
            station['fc_trigger'] = 0
            stations.append(station)

        with open(self.extractedGlofasPath, 'w') as fp:
            json.dump(stations, fp)
            print('Extracted Glofas data - File saved')

        with open(self.triggerPerDay, 'w') as fp:
            json.dump([trigger_per_day], fp)
            print('Extracted Glofas data - Trigger per day File saved')

    def findTrigger(self):
        logging.info("Started processing glofas data: " + self.fcStep)

        # Load (static) threshold values per station

        df_thresholds = DataFrame(self.GLOFAS_STATIONS)
        df_thresholds.columns = self.glofas_cols
        df_thresholds = df_thresholds.set_index("station_code", drop=False)
        df_thresholds.sort_index(inplace=True)
        # Load extracted Glofas discharge levels per station
        with open(self.extractedGlofasPath) as json_data:
            d = json.load(json_data)
        df_discharge = pd.DataFrame(d)
        df_discharge.index = df_discharge['code']
        df_discharge.sort_index(inplace=True)

        # Merge two datasets
        df = pd.merge(df_thresholds, df_discharge, left_index=True,
                      right_index=True)  # on=['station_code','code'])

        # Dtermine trigger + return period per water station
        for index, row in df.iterrows():
            fc = float(row['fc'])
            trigger = int(row['fc_trigger'])
            if trigger == 1:
                if self.country_code == 'ZMB':
                    if fc >= row['20yr_threshold']:
                        return_period = 20
                    elif fc >= row['10yr_threshold']:
                        return_period = 10
                    elif fc >= row['5yr_threshold']:
                        return_period = 10
                    elif fc >= row['2yr_threshold']:
                        return_period = 10
                    else:
                        return_period = 0
                else:
                    return_period = 25
            else:
                return_period = None
            df.at[index, 'fc_rp'] = return_period

        out = df.to_json(orient='records')
        with open(self.triggersPerStationPath, 'w') as fp:
            fp.write(out)
            print('Processed Glofas data - File saved')
