import netCDF4
import os
from os import listdir
from os.path import isfile, join
import xarray as xr
import numpy as np
import pandas as pd
import sys
import json
import logging
import urllib.request
import urllib.error
import time
from lib.logging.logglySetup import logger
from settings import *
import math
from pathlib import Path
import geopandas as gpd
from shapely.geometry import Point
from scipy.interpolate import griddata
import subprocess
from datetime import datetime
from bs4 import BeautifulSoup
import requests


class RainfallData:

    def __init__(self, fcStep, days):
        self.fcStep = fcStep
        self.days = days
        self.inputPath = PIPELINE_DATA+'input/rainfall/'
        # self.extractedGlofasPath = PIPELINE_OUTPUT + \
        #     'glofas_extraction/glofas_forecast_' + self.fcStep + '_' + COUNTRY_CODE + '.json' ## create name of outputs, stick to json
        self.triggersPerStationPath = PIPELINE_OUTPUT + \
            'triggers_rp_per_station/triggers_rp_' + self.fcStep + '_' + COUNTRY_CODE + '.json'

    def process(self):
        self.removeOldForecastData()
        # self.listFD()
        # self.download_GFS_forecast()
        # self.bound_extent()
        self.download()
        # self.extract()
        self.findTrigger()

    def removeOldForecastData(self):
        for f in [f for f in os.listdir(self.inputPath)]:
            os.remove(os.path.join(self.inputPath, f))
            
    def download(self):
        if RAINFALL_DUMMY == False:
            downloadDone = False
    
            timeToTryDownload = 43200
            timeToRetry = 600
    
            start = time.time()
            end = start + timeToTryDownload
    
            while downloadDone == False and time.time() < end:
                try:
                    self.download_GFS_forecast()
                    downloadDone = True
                except urllib.error.URLError:
                    logger.info(
                        "GFS download failed. "
                        "Trying again in 10 minutes")
                    time.sleep(timeToRetry)
            if downloadDone == False:
                raise ValueError('GFS download failed for ' +
                                 str(timeToTryDownload/3600) + ' hours, no new dataset was found')

        else:
            self.inputPath = PIPELINE_DATA + 'input/rainfall_dummy/'

    def bound_extent(self, shapefile):
        '''
        Create a bounding box from shapefile extent.
        Note that this script is for GRS, northern hemisphere.
        Other coordinate system or southern hemisphere might need modification.
    
        Parameters
        ----------
        shapefile : geopandas dataframe
            shapefile of the country
    
        Returns
        -------
        west, south, east, north
            tuple with bounding box extent
    
        '''
        
        if abs(shapefile.total_bounds[0] - math.floor(shapefile.total_bounds[0])) > 0.5: #west extent
            west = math.floor(shapefile.total_bounds[0]) + 0.5
        elif abs(shapefile.total_bounds[0] - math.floor(shapefile.total_bounds[0])) < 0.5:
            west = math.floor(shapefile.total_bounds[0])
        else:
            west = shapefile.total_bounds[0]
        
        if abs(shapefile.total_bounds[1] - math.floor(shapefile.total_bounds[1])) > 0.5: #south extent
            south = math.floor(shapefile.total_bounds[1]) + 0.5
        elif abs(shapefile.total_bounds[1] - math.floor(shapefile.total_bounds[1])) < 0.5:
            south = math.floor(shapefile.total_bounds[1])
        else:
            south = shapefile.total_bounds[1]
        
        if abs(shapefile.total_bounds[2] - math.floor(shapefile.total_bounds[2])) > 0.5: #east extent
            east = math.ceil(shapefile.total_bounds[2])
        elif abs(shapefile.total_bounds[2] - math.ceil(shapefile.total_bounds[2])) < 0.5:
            east = math.floor(shapefile.total_bounds[2]) + 0.5
        else:
            east = shapefile.total_bounds[2]
        
        if abs(shapefile.total_bounds[3] - math.floor(shapefile.total_bounds[3])) > 0.5: #north extent
            north = math.ceil(shapefile.total_bounds[3])
        elif abs(shapefile.total_bounds[3] - math.ceil(shapefile.total_bounds[3])) < 0.5:
            north = math.floor(shapefile.total_bounds[3]) + 0.5
        else:
            north = shapefile.total_bounds[3]
            
        return west, south, east, north
    
    def listFD(self, url, ext=''):
        page = requests.get(url).text
        soup = BeautifulSoup(page, 'html.parser')
        
        return [url + node.get('href') for node in soup.find_all('a') if node.get('href')]    
    
    def download_GFS_forecast(self):
         
        # url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/' 
        all_url = self.listFD(GFS_SOURCE, ext='')
        gfs_url = sorted([i for i in all_url if i.split('/')[-2].startswith('gfs.')], reverse=True)
        # url_date = []
        fc_hrs = np.arange(3, 267, 3)
        
        for url_date in gfs_url:
            # latest_day_url = gfs_url[-1]
            date = url_date.split('/')[-2][4:]
            hour_url = self.listFD(url_date, ext='')
            # runcycle = ['00', '06', '12', '18']
            
            if len(hour_url) == 5: # check if there are all 4 runcycle + parent directory in the hour_url
                                
                for url_i in hour_url[1:]:
                    url_list = self.listFD(url_i, ext='')
                    hr = url_i.split('/')[-2]
                    filename_in = ['gfs.t' + hr + 'z.pgrb2.0p50.f' + '%03d'%fc_hr for fc_hr in fc_hrs]
                    
                    for name in filename_in:
                        # DOWNLOAD ALL GRB2 FILES OF THE DATE
                        batch_ex_download = "wget -nd -e robots=off -P %s -A %s %s" %(self.inputPath, name, url_i + name) 
                        subprocess.call(batch_ex_download, cwd=self.inputPath, shell=True)
                    filename_out = str(date + '_' + hr)
                    print(datetime.now().strftime("%H:%M:%S"), filename_out)
                    # EXTRACT AND MERGE
                    # filename_in1 = 'gfs_4_' + date + '_' + hr + '_???'
                    batch_ex_filter = "cat gfs.* | wgrib2 - -match '(:APCP:)' -ncep_norm %s.grb2" %(filename_out)
                    subprocess.check_output(batch_ex_filter, cwd=self.inputPath, shell=True)
                    # DELETE
                    batch_ex_delete = "rm  gfs.*"
                    subprocess.call(batch_ex_delete, cwd=self.inputPath, shell=True)
                    
                break
            else:
                print(date, ' does not have all run cycles. Now trying the runs of the previous day.')
                continue

    def findTrigger(self):
        logging.info("Started processing glofas data: " + self.fcStep)

        # Load (static) threshold values per station

        df_thresholds = pd.read_csv(WATERSTATIONS_TRIGGERS) ### PHUOC TO CORRECT DIRS IN SETTINGS.PY FILE
        
        ### COMPARE WITH THE THRESHOLD
        grb_files = sorted([f for f in os.listdir(self.inputPath) if f.endswith('.grb2')])
        
        ### COUNTRY SETTINGS
        # country_code = 'egy'
        adm_shp = gpd.read_file(VECTOR_DISTRICT_DATA)
        
        west, south, east, north = self.bound_extent(adm_shp)
        
        lats = slice(north, south) #32, 22
        lons = slice(west, east) #24.5, 37
        
        ### CREATE EMPTY VARIABLES FOR ANALYSIS
        grb_by_day = xr.DataArray()
        mean_by_day = xr.DataArray()
        
        ###  COMPARE THE THRESHOLD WITH AVERAGE OF ALL RUN CYCLES OF THE DAY (2 LEADTIMES X 1 AVG)
        for file in grb_files:
            file_dir = self.inputPath + file
            # grb = pygrib.open(file_dir)
            grb = xr.open_dataset(file_dir, engine='cfgrib')
            grb_clip = grb.sel(latitude=lats, longitude=lons) # clip grb with country extent
            runcycle = str(grb_clip.time.dt.year.values) + '%02d'%grb_clip.time.dt.month.values + '%02d'%grb_clip.time.dt.day.values + '%02d'%grb_clip.time.dt.hour.values
            # grb_clip.rolling(step=accum_duration, center=False).sum()
            fc_dayrange = np.unique(pd.to_datetime(grb_clip.valid_time.values).date)
            grb_24hrs = grb_clip.groupby(grb_clip.valid_time.dt.day).sum().drop(labels=['time', 'surface']) # sum rainfall by day
            
            for fc_day in fc_dayrange:#grb_24hrs.day.values:
                # fc_day = np.datetime64(str(grb_clip.time.dt.year.values) + '-' + str(grb_clip.time.dt.month.values) + '-' + str(day))
                print(fc_day)
                if len(grb_by_day.coords) == 0:
                    grb_by_day = grb_24hrs.sel(day=fc_day.day).rename({'tp': 'tp_%s'%runcycle}).assign_coords(fc_day=fc_day).expand_dims('fc_day').drop(labels='day')
                else:    
                    grb_by_day = xr.combine_by_coords([grb_by_day, grb_24hrs.sel(day=fc_day.day).rename({'tp': 'tp_%s'%runcycle}).assign_coords(fc_day=fc_day).expand_dims('fc_day').drop(labels='day')])
        
        mean_by_day = grb_by_day.to_array(dim='tp_mean_by_day').mean('tp_mean_by_day').rename('mean_by_day')
        # sd_by_day = grb_by_day.to_array(dim='tp_sd_by_day').std('tp_sd_by_day')
        # mean_by_day = xr.combine_by_coords([mean_by_day, sd_by_day])
        
        # runcycle_day = str(grb_clip.time.dt.year.values) + '%02d'%grb_clip.time.dt.month.values + '%02d'%grb_clip.time.dt.day.values
        
        # for leadtime in np.unique(df_thresholds.forecast_time.values):
            
        ## threshold (1 degree)
        df_leadtime = df_thresholds[df_thresholds.forecast_time == self.fcStep]
        geometry = [Point(xy) for xy in zip(df_leadtime.lon.astype(float), df_leadtime.lat.astype(float))]
        threshold_gdf = gpd.GeoDataFrame(df_leadtime, geometry=geometry).set_crs("EPSG:4326")
        
        ## forecast (.5 degree)
        fc_by_day = mean_by_day.sel(fc_day=mean_by_day.fc_day.values[leadtime-1]).to_dataframe().reset_index()
        geometry = [Point(xy) for xy in zip(fc_by_day.longitude.astype(float), fc_by_day.latitude.astype(float))]
        fc_gdf = gpd.GeoDataFrame(fc_by_day, geometry=geometry).set_crs("EPSG:4326")
        
        ## spatial join forecast and threshold and check if a location has rainfall exceeding the threshold
        compare_gdf = gpd.sjoin(fc_gdf, threshold_gdf, how='left', op='intersects')
        
        # interpolate NaN cells
        known = ~np.isnan(compare_gdf['forecast_time'])
        unknown = ~known
        z = griddata((compare_gdf['longitude'][known], compare_gdf['latitude'][known]), compare_gdf[TRIGGER_RP_COLNAME][known], (compare_gdf['longitude'][unknown], compare_gdf['latitude'][unknown]))
        compare_gdf[TRIGGER_RP_COLNAME][unknown] = z.tolist()
        
        compare_gdf[str(str(leadtime)+'_pred')] = np.where((compare_gdf['mean_by_day'] > compare_gdf[TRIGGER_RP_COLNAME]), 1, 0)
        compare_gdf['fc_day'] = compare_gdf['fc_day'].astype(str)
        df_trigger = compare_gdf.filter(['latitude','longitude','geometry','10_pred'])
        
        out = df_trigger.to_json(orient='records')            
        # output_name = '%s_%sday_'%(runcycle_day, leadtime) +TRIGGER_RP_COLNAME
        with open(self.triggersPerStationPath, 'w') as fp:
            fp.write(out)
            print('Processed Glofas data - File saved')
        
        # cube = make_geocube(vector_data=compare_gdf, measurements=[str(str(leadtime)+'_pred')], resolution=(0.5, -0.5), output_crs="EPSG:4326")
        # cube.rio.to_raster(PIPELINE_OUTPUT + '/' + output_name + '.tif')
        # compare_gdf.to_file(outpath + 'option2/' + output_name + '.shp')
            
            