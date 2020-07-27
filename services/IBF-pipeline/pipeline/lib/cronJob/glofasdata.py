import netCDF4
import xarray as xr
import os
from os import listdir
from os.path import isfile, join
import pandas as pd
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
from secrets import GLOFAS_USER, GLOFAS_PW


class GlofasData:

    def __init__(self, fcStep, days):
        self.fcStep = fcStep
        self.days = days
        self.inputPath = PIPELINE_DATA+'input/glofas/'
        self.extractedGlofasPath = PIPELINE_OUTPUT + \
            'glofas_extraction/glofas_forecast_' + self.fcStep + '_' + COUNTRY_CODE + '.json'
        self.triggersPerStationPath = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/triggers_rp_' + self.fcStep + '_' + COUNTRY_CODE + '.json'

    def process(self):
        self.removeOldGlofasData()
        self.download()
        self.extract()
        self.findTrigger()

    def removeOldGlofasData(self):
        for f in [f for f in os.listdir(self.inputPath)]:
            os.remove(os.path.join(self.inputPath, f))

    def download(self):
        if GLOFAS_DUMMY == False:
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

        else:
            self.inputPath = PIPELINE_DATA + 'input/glofas_dummy/'

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

        # Load file with thresholds per station (only once, so before loop)
        df_thresholds = pd.read_csv(
            WATERSTATIONS_TRIGGERS, delimiter=';', encoding="windows-1251")
        df_thresholds = df_thresholds.set_index("station_code", drop=False)

        stations = []
        for i in range(0, len(files)):
            logging.info("Extracting glofas data from %s", i)
            Filename = os.path.join(self.inputPath, files[i])
            station = {}
            station['code'] = files[i].split(
                '_')[2] if GLOFAS_DUMMY == False else files[i].split('_')[4]

            data = xr.open_dataset(Filename)

            # Get threshold for this specific station
            if station['code'] in df_thresholds['station_code']:
                print(Filename)
                threshold = df_thresholds[df_thresholds.station_code ==
                                        station['code']][TRIGGER_RP_COLNAME][0]

                # Set dimension-values
                time = 0
                step = self.days

                # Loop through 51 ensembles, get forecast (for 3 or 7 day) and compare to threshold
                ensemble_options = 51
                if GLOFAS_DUMMY == True:
                    ensemble_options = 1
                count = 0
                dis_sum = 0
                for ensemble in range(0, ensemble_options):

                    discharge = data['dis'].sel(
                        ensemble=ensemble, step=step).values[time][0]

                    # DUMMY OVERWRITE FOR NOW
                    if OVERWRITE_DUMMY == True:
                        if self.fcStep == 'short':
                            discharge = 0
                        elif station['code'] == 'G1361': # ZMB dummy flood station 1
                            discharge = 8000
                        elif station['code'] == 'G1328': # ZMB dummy flood station 2
                            discharge = 9000
                        elif station['code'] == 'G6106': # UGA dummy flood station
                            discharge = 200
                        else:
                            discharge = 0

                    if discharge >= threshold:
                        count = count + 1
                    dis_sum = dis_sum + discharge

                prob = count/ensemble_options
                dis_avg = dis_sum/ensemble_options
                station['fc_' + self.fcStep] = dis_avg
                station['fc_' + self.fcStep+'_prob'] = prob
                station['fc_'+self.fcStep+'_trigger'] = 1 if prob > TRIGGER_LEVELS['minimum'] else 0

                stations.append(station)

            data.close()
        
        # Add 'no_station' and all currently unavailable glofas-stations manually for now
        for station_code in ['no_station']: #,'F0043','F0044','F0045','F0046','F0047','F0048','F0049','F0050','F0051','F0052','F0053','F0054','F0055','F0056','G5696']:
            station = {}
            station['code']=station_code
            station['fc_' + self.fcStep] = 0
            station['fc_' + self.fcStep+'_prob'] = 0
            station['fc_'+self.fcStep+'_trigger'] = 0
            stations.append(station)

        with open(self.extractedGlofasPath, 'w') as fp:
            json.dump(stations, fp)
            print('Extracted Glofas data - File saved')

    def findTrigger(self):
        logging.info("Started processing glofas data: " + self.fcStep)

        # Load (static) threshold values per station

        df_thresholds = pd.read_csv(
            WATERSTATIONS_TRIGGERS, delimiter=';', encoding="windows-1251")
        df_thresholds.index = df_thresholds['station_code']
        df_thresholds.sort_index(inplace=True)
        # Load extracted Glofas discharge levels per station
        with open(self.extractedGlofasPath) as json_data:
            d = json.load(json_data)
        df_discharge = pd.DataFrame(d)
        df_discharge.index = df_discharge['code']
        df_discharge.sort_index(inplace=True)
        #print(df_thresholds)
        #print(df_discharge)

        # Merge two datasets
        df = pd.merge(df_thresholds, df_discharge, left_index=True,
                      right_index=True)  # on=['station_code','code'])

        # Dtermine trigger + return period per water station
        for index, row in df.iterrows():
            fc = float(row['fc_'+self.fcStep])
            trigger = int(row['fc_'+self.fcStep+'_trigger'])
            if trigger == 1:
                if COUNTRY_CODE == 'UGA':
                    return_period = 25
                elif fc >= row['20yr_threshold']:
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
                return_period = None
            df.at[index, 'fc_'+self.fcStep+'_rp'] = return_period

        out = df.to_json(orient='records')
        with open(self.triggersPerStationPath, 'w') as fp:
            fp.write(out)
            print('Processed Glofas data - File saved')
