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
import logging
import urllib.request
import urllib.error
import tarfile
import time
import cdsapi
from lib.logging.logglySetup import logger
from lib.pipeline.dynamicDataDb import DatabaseManager
from settings import *
from secrets import *


class GlofasData:

    def __init__(self, leadTimeLabel, leadTimeValue, country_code, glofas_stations, district_mapping):
        self.db = DatabaseManager(leadTimeLabel, country_code)
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue
        self.country_code = country_code
        self.inputPath = PIPELINE_DATA+'input/glofas/'
        self.triggerPerDay = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/trigger_per_day_' + country_code + '.json'
        self.extractedGlofasPath = PIPELINE_OUTPUT + \
            'glofas_extraction/glofas_forecast_' + \
            self.leadTimeLabel + '_' + country_code + '.json'
        self.triggersPerStationPath = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/triggers_rp_' + \
            self.leadTimeLabel + '_' + country_code + '.json'
        self.GLOFAS_STATIONS = glofas_stations
        self.DISTRICT_MAPPING = district_mapping
        self.current_date = CURRENT_DATE.strftime('%Y-%m-%d')

    def process(self):
        self.removeOldGlofasData()
        self.download()
        if self.country_code == 'ZMB': #Temporarily keep using FTP for Zambia
            self.extractFtpData()
        else:
            self.extractApiData()
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
                if self.country_code == 'ZMB': #Temporarily keep using FTP for Zambia
                    self.makeFtpRequest()
                else:
                    self.makeApiRequest()
                downloadDone = True
            except Exception as exception:
                error = 'Download data failed. Trying again in {} minutes.\n{}'.format(timeToRetry//60, exception)
                print(error)
                logger.info(error)
                time.sleep(timeToRetry)
        if downloadDone == False:
            raise ValueError('GLofas download failed for ' +
                            str(timeToTryDownload/3600) + ' hours, no new dataset was found')

    def makeFtpRequest(self):
        filename = GLOFAS_FILENAME + '_' + self.current_date + '00.tar.gz'
        ftp_path = 'ftp://'+GLOFAS_USER+':'+GLOFAS_PW + '@' + GLOFAS_FTP
        urllib.request.urlretrieve(ftp_path + filename,
                                   self.inputPath + filename)

        tar = tarfile.open(self.inputPath + filename, "r:gz")
        tar.extractall(self.inputPath)
        tar.close()

    def makeApiRequest(self):
        path = 'glofas/glofas-forecast-' + self.current_date.replace('-','') + '.nc'
        glofasDataFile = self.db.getDataFromDatalake(path)
        if glofasDataFile.status_code >= 400:
            raise ValueError()
        open(self.inputPath+'glofas-api-'+self.country_code+'-'+self.current_date+'.nc', 'wb').write(glofasDataFile.content)

    def extractFtpData(self):
        print('\nExtracting FTP Glofas Data\n')

        files = [f for f in listdir(self.inputPath) if isfile(
            join(self.inputPath, f)) and f.endswith('.nc')]

        df_thresholds = pd.read_json(json.dumps(self.GLOFAS_STATIONS))
        df_thresholds = df_thresholds.set_index("stationCode", drop=False)
        df_district_mapping = pd.read_json(json.dumps(self.DISTRICT_MAPPING))
        df_district_mapping = df_district_mapping.set_index("glofasStation", drop=False)

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

                        # DUMMY OVERWRITE DEPENDING ON COUNTRY SETTING
                        if SETTINGS_SECRET[self.country_code]['mock'] == True:
                            if SETTINGS_SECRET[self.country_code]['if_mock_trigger'] == True:
                                if step < 5: # Only dummy trigger for 5-day and above
                                    discharge = 0
                                elif station['code'] == 'G1361':  # ZMB dummy flood station 1
                                    discharge = 8000
                                elif station['code'] == 'G1328':  # ZMB dummy flood station 2
                                    discharge = 9000
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
                        trigger_per_day[step] = 1

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

    def extractApiData(self):
        print('\nExtracting Glofas Data\n')

        # Load input data
        df_thresholds = pd.read_json(json.dumps(self.GLOFAS_STATIONS))
        df_thresholds = df_thresholds.set_index("stationCode", drop=False)
        df_district_mapping = pd.read_json(json.dumps(self.DISTRICT_MAPPING))
        df_district_mapping = df_district_mapping.set_index("glofasStation", drop=False)

        # Set up variables to fill
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

        # Load netCDF data
        ncData = xr.open_dataset(self.inputPath+'glofas-api-'+self.country_code+'-'+self.current_date+'.nc')

        # Transform lon/lat values
        lons=np.linspace(ncData.dis24.attrs['GRIB_longitudeOfFirstGridPointInDegrees'],
                 ncData.dis24.attrs['GRIB_longitudeOfLastGridPointInDegrees'],
                 num=ncData.dis24.attrs['GRIB_Nx'])
        lats=np.linspace(ncData.dis24.attrs['GRIB_latitudeOfFirstGridPointInDegrees'],
                    ncData.dis24.attrs['GRIB_latitudeOfLastGridPointInDegrees'],
                    num=ncData.dis24.attrs['GRIB_Ny'])
        ds=ncData['dis24']
        ds.coords['latitude'] = lats
        ds.coords['longitude'] = lons
        ncData2=ds.to_dataset()

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

                    deltax=0.1
                    st_lat=row['lat'] #34.05
                    st_lon=row['lon'] #0.05
                    for ensemble in range(1, ensemble_options):

                        dischargeArray = ncData2['dis24'].sel(latitude=slice(st_lat+deltax,st_lat-deltax), longitude=slice(st_lon-deltax,st_lon+deltax),step=str(step)+' days',number=ensemble).values.flatten()
                        discharge = np.nanmax(dischargeArray)

                        # MOCK OVERWRITE DEPENDING ON COUNTRY SETTING
                        if SETTINGS_SECRET[self.country_code]['mock'] == True:
                            if SETTINGS_SECRET[self.country_code]['if_mock_trigger'] == True:
                                if step < 5: # Only dummy trigger for 5-day and above
                                    discharge = 0
                                elif station['code'] == 'DWRM1':  # UGA dummy flood station 1
                                    discharge = 1000
                                elif station['code'] == 'G1067':  # ETH dummy flood station 1
                                    discharge = 1000
                                elif station['code'] == 'G1904':  # ETH dummy flood station 2
                                    discharge = 2000
                                elif station['code'] == 'G5194':  # KEN dummy flood station
                                    discharge = 2000
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
                        trigger_per_day[step] = 1

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
        logging.info("Started processing glofas data: " + self.leadTimeLabel)

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
                if self.country_code == 'ZMB':
                    if fc >= row['threshold20Year']:
                        return_period = 20
                    elif fc >= row['threshold10Year']:
                        return_period = 10
                    elif fc >= row['threshold5Year']:
                        return_period = 10
                    elif fc >= row['threshold2Year']:
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
