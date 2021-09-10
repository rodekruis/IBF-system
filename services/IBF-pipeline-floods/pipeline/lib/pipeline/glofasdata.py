import netCDF4
import xarray as xr
import numpy as np
import os
from os import listdir
from os.path import isfile, join
import pandas as pd
from pandas import DataFrame
import sys
import json
import datetime
import urllib.request
import urllib.error
import tarfile
import time
import cdsapi
from lib.pipeline.dynamicDataDb import DatabaseManager
from settings import *
from secrets import *


class GlofasData:

    def __init__(self, leadTimeLabel, leadTimeValue, countryCodeISO3, glofas_stations, district_mapping):
        self.db = DatabaseManager(leadTimeLabel, countryCodeISO3)
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue
        self.countryCodeISO3 = countryCodeISO3
        self.inputPath = PIPELINE_DATA+'input/glofas/'
        self.triggerPerDay = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/trigger_per_day_' + countryCodeISO3 + '.json'
        self.extractedGlofasPath = PIPELINE_OUTPUT + \
            'glofas_extraction/glofas_forecast_' + \
            self.leadTimeLabel + '_' + countryCodeISO3 + '.json'
        self.triggersPerStationPath = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/triggers_rp_' + \
            self.leadTimeLabel + '_' + countryCodeISO3 + '.json'
        self.GLOFAS_STATIONS = glofas_stations
        self.DISTRICT_MAPPING = district_mapping
        self.current_date = CURRENT_DATE.strftime('%Y%m%d')

    def process(self):
        if SETTINGS_SECRET[self.countryCodeISO3]['mock'] == False:
            self.removeOldGlofasData()
            self.download()
        if SETTINGS_SECRET[self.countryCodeISO3]['mock'] == True:
            self.extractMockData()
        else:
            self.extractGlofasData()
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
                self.getGlofasData()
                downloadDone = True
            except Exception as exception:
                error = 'Download data failed. Trying again in {} minutes.\n{}'.format(timeToRetry//60, exception)
                print(error)
                time.sleep(timeToRetry)
        if downloadDone == False:
            raise ValueError('GLofas download failed for ' +
                            str(timeToTryDownload/3600) + ' hours, no new dataset was found')

    def getGlofasData(self):
        filename = GLOFAS_FILENAME + '_' + self.current_date + '00.tar.gz'
        path = 'glofas/' + filename
        glofasDataFile = self.db.getDataFromDatalake(path)
        if glofasDataFile.status_code >= 400:
            raise ValueError()
        open(self.inputPath + filename, 'wb').write(glofasDataFile.content)
        tar = tarfile.open(self.inputPath + filename, "r:gz")
        tar.extractall(self.inputPath)
        tar.close()

    def extractGlofasData(self):
        print('\nExtracting Glofas (FTP) Data\n')

        files = [f for f in listdir(self.inputPath) if isfile(
            join(self.inputPath, f)) and f.endswith('.nc')]

        df_thresholds = pd.read_json(json.dumps(self.GLOFAS_STATIONS))
        df_thresholds = df_thresholds.set_index("stationCode", drop=False)
        df_district_mapping = pd.read_json(json.dumps(self.DISTRICT_MAPPING))
        df_district_mapping = df_district_mapping.set_index("glofasStation", drop=False)

        stations = []
        trigger_per_day = {
            '1-day': False,
            '2-day': False,
            '3-day': False,
            '4-day': False,
            '5-day': False,
            '6-day': False,
            '7-day': False,
        }
        for i in range(0, len(files)):
            Filename = os.path.join(self.inputPath, files[i])
            
            # Skip old stations > need to be removed from FTP
            if 'G5230_Na_ZambiaRedcross' in Filename or 'G5196_Uganda_Gauge' in Filename:
                continue

            station = {}
            station['code'] = files[i].split(
                '_')[2]

            data = xr.open_dataset(Filename)

            # Get threshold for this specific station
            if station['code'] in df_thresholds['stationCode'] and station['code'] in df_district_mapping['glofasStation']:
                
                print(Filename)
                threshold = df_thresholds[df_thresholds['stationCode'] ==
                                          station['code']][TRIGGER_LEVEL][0]

                # Set dimension-values
                time = 0

                for step in range(1, 8):

                    # Loop through 51 ensembles, get forecast and compare to threshold
                    ensemble_options = 51
                    count = 0
                    dis_sum = 0
                    for ensemble in range(0, ensemble_options):

                        discharge = data['dis'].sel(
                            ensemble=ensemble, step=step).values[time][0]

                        if discharge >= threshold:
                            count = count + 1
                        dis_sum = dis_sum + discharge

                    prob = count/ensemble_options
                    dis_avg = dis_sum/ensemble_options
                    station['fc'] = dis_avg
                    station['fc_prob'] = prob
                    station['fc_trigger'] = 1 if prob > TRIGGER_LEVELS['minimum'] else 0

                    if station['fc_trigger'] == 1:
                        trigger_per_day[str(step)+'-day'] = True

                    if step == self.leadTimeValue:
                        stations.append(station)
                    station = {}
                    station['code'] = files[i].split(
                        '_')[2]

            data.close()

        # Add 'no_station'
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

    def extractMockData(self):
        print('\nExtracting Glofas (mock) Data\n')

        # Load input data
        df_thresholds = pd.read_json(json.dumps(self.GLOFAS_STATIONS))
        df_thresholds = df_thresholds.set_index("stationCode", drop=False)
        df_district_mapping = pd.read_json(json.dumps(self.DISTRICT_MAPPING))
        df_district_mapping = df_district_mapping.set_index("glofasStation", drop=False)

        # Set up variables to fill
        stations = []
        trigger_per_day = {
            '1-day': False,
            '2-day': False,
            '3-day': False,
            '4-day': False,
            '5-day': False,
            '6-day': False,
            '7-day': False,
        }

        for index, row in df_thresholds.iterrows():
            station = {}
            station['code'] = row['stationCode']

            if station['code'] in df_district_mapping['glofasStation'] and station['code'] != 'no_station':
                print(station['code'])
                threshold = df_thresholds[df_thresholds['stationCode'] ==
                                          station['code']][TRIGGER_LEVEL][0]

                for step in range(1, 8):
                    # Loop through 51 ensembles, get forecast and compare to threshold
                    ensemble_options = 51
                    count = 0
                    dis_sum = 0

                    for ensemble in range(1, ensemble_options):

                        # MOCK OVERWRITE DEPENDING ON COUNTRY SETTING
                        if SETTINGS_SECRET[self.countryCodeISO3]['if_mock_trigger'] == True:
                            if step < 5: # Only dummy trigger for 5-day and above
                                discharge = 0
                            elif station['code'] == 'G5220':  # UGA dummy flood station 1
                                discharge = 600
                            elif station['code'] == 'G1067':  # ETH dummy flood station 1
                                discharge = 5000
                            elif station['code'] == 'G1904':  # ETH dummy flood station 2
                                discharge = 15000
                            elif station['code'] == 'G5194':  # KEN dummy flood station
                                discharge = 2000
                            elif station['code'] == 'G1361':  # ZMB dummy flood station 1
                                discharge = 8000
                            elif station['code'] == 'G1328':  # ZMB dummy flood station 2
                                discharge = 9000
                            elif station['code'] == 'G1319':  # ZMB dummy flood station 3
                                discharge = 1400
                            else:
                                discharge = 0
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
                        trigger_per_day[str(step)+'-day'] = True

                    if step == self.leadTimeValue:
                        stations.append(station)
                    station = {}
                    station['code'] = row['stationCode']


        # Add 'no_station'
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
        # Load (static) threshold values per station
        df_thresholds = pd.read_json(json.dumps(self.GLOFAS_STATIONS))
        df_thresholds = df_thresholds.set_index("stationCode", drop=False)
        df_thresholds.sort_index(inplace=True)
        # Load extracted Glofas discharge levels per station
        with open(self.extractedGlofasPath) as json_data:
            d = json.load(json_data)
        df_discharge = pd.DataFrame(d)
        df_discharge.index = df_discharge['code']
        df_discharge.sort_index(inplace=True)

        # Merge two datasets
        df = pd.merge(df_thresholds, df_discharge, left_index=True,
                      right_index=True)
        del df['lat']
        del df['lon']

        # Dtermine trigger + return period per water station
        for index, row in df.iterrows():
            fc = float(row['fc'])
            trigger = int(row['fc_trigger'])
            if trigger == 1:
                if self.countryCodeISO3 == 'ZMB':
                    if fc >= row['threshold20Year']:
                        return_period_flood_extent = 20
                    else:
                        return_period_flood_extent = 10
                else:
                    return_period_flood_extent = 25
            else:
                return_period_flood_extent = None
                
            if fc >= row['threshold20Year']:
                return_period = 20
            elif fc >= row['threshold10Year']:
                return_period = 10
            elif fc >= row['threshold5Year']:
                return_period = 5
            elif fc >= row['threshold2Year']:
                return_period = 2
            else:
                return_period = None
            
            df.at[index, 'fc_rp_flood_extent'] = return_period_flood_extent
            df.at[index, 'fc_rp'] = return_period

        out = df.to_json(orient='records')
        with open(self.triggersPerStationPath, 'w') as fp:
            fp.write(out)
            print('Processed Glofas data - File saved')