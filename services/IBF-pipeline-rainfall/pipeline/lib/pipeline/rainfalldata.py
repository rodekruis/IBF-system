import os
import xarray as xr
import numpy as np
import pandas as pd
from pandas import DataFrame
import urllib.request
import urllib.error
import time
from settings import *
import math
import geopandas as gpd
from shapely.geometry import Point
from scipy.interpolate import griddata
import subprocess
from datetime import datetime
from bs4 import BeautifulSoup
import requests
import json
from geocube.api.core import make_geocube
from secrets import SETTINGS_SECRET


class RainfallData:

    def __init__(self, leadTimeLabel, leadTimeValue, countryCodeISO3, admin_area_gdf, rainfall_triggers):
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue
        self.countryCodeISO3 = countryCodeISO3
        self.inputPath = PIPELINE_DATA + 'input/rainfall/'
        self.rainrasterPath = RASTER_OUTPUT + \
            '0/rainfall_extents/rain_rp_' + leadTimeLabel + '_' + countryCodeISO3 + '.tif'
        self.rainfall_triggers = rainfall_triggers
        self.ADMIN_AREA_GDF = admin_area_gdf
        self.downloaded = False

    def process(self):
        if not self.downloaded:
            self.removeOldForecastData()
            self.download()
        if SETTINGS_SECRET[self.countryCodeISO3]['mock'] == True:
            self.findTrigger_mock()
        else:
            self.findTrigger()

    def removeOldForecastData(self):
        os.makedirs(self.inputPath, exist_ok=True)
        for f in [f for f in os.listdir(self.inputPath)]:
            os.remove(os.path.join(self.inputPath, f))

    def download(self):
        if SETTINGS_SECRET[self.countryCodeISO3]['mock'] == True:
            self.inputPath = PIPELINE_DATA + 'input/rainfall_dummy/'

        else:
            downloadDone = False

            timeToTryDownload = 43200
            timeToRetry = 600

            start = time.time()
            end = start + timeToTryDownload

            while downloadDone == False and time.time() < end:
                try:
                    self.download_GEFS_forecast()
                    downloadDone = True
                    self.downloaded = True
                except urllib.error.URLError:
                    print(
                        "GEFS download failed. "
                        "Trying again in 10 minutes")
                    time.sleep(timeToRetry)
            if downloadDone == False:
                raise ValueError('GFS download failed for ' +
                                 str(timeToTryDownload / 3600) + ' hours, no new dataset was found')

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

        # west extent
        if abs(shapefile.total_bounds[0] - math.floor(shapefile.total_bounds[0])) > 0.5:
            west = math.floor(shapefile.total_bounds[0]) + 0.5
        elif abs(shapefile.total_bounds[0] - math.floor(shapefile.total_bounds[0])) < 0.5:
            west = math.floor(shapefile.total_bounds[0])
        else:
            west = shapefile.total_bounds[0]

        # south extent
        if abs(shapefile.total_bounds[1] - math.floor(shapefile.total_bounds[1])) > 0.5:
            south = math.floor(shapefile.total_bounds[1]) + 0.5
        elif abs(shapefile.total_bounds[1] - math.floor(shapefile.total_bounds[1])) < 0.5:
            south = math.floor(shapefile.total_bounds[1])
        else:
            south = shapefile.total_bounds[1]

        # east extent
        if abs(shapefile.total_bounds[2] - math.floor(shapefile.total_bounds[2])) > 0.5:
            east = math.ceil(shapefile.total_bounds[2])
        elif abs(shapefile.total_bounds[2] - math.ceil(shapefile.total_bounds[2])) < 0.5:
            east = math.floor(shapefile.total_bounds[2]) + 0.5
        else:
            east = shapefile.total_bounds[2]

        # north extent
        if abs(shapefile.total_bounds[3] - math.floor(shapefile.total_bounds[3])) > 0.5:
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

    def download_GEFS_forecast(self):


        url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/naefs/prod/'
        
        url_1 = self.listFD(url, ext='')#[1:]
        gefs_url = sorted([i for i in url_1 if i.split('/')[-2].startswith('gefs.')], reverse=True)
        fc_hrs = np.arange(24, 198, 24)
        
        for url_date in gefs_url:
            date = url_date.split('/')[-2][5:]
            hour_url = self.listFD(url_date, ext='')
            # runcycle = ['00', '06', '12', '18']

            if len(hour_url) >= 2: # check if there are dir of all 4 runcycle and the parent directory in the url

                for url_i in hour_url[1:2]:
                    # url_list = listFD(url_i, ext='')
                    hr = url_i.split('/')[-2]
                    filename_in = ['geprcp.t' + hr + 'z.pgrb2a.0p50.bc_24hf' + 
                                   '%03d'%fc_hr for fc_hr in fc_hrs]

                    for name in filename_in:
            
                        # DOWNLOAD ALL GRB2 FILES OF THE DATE
                        # batch_ex_download = "wget -nd robots=off -r -P %s '-A %s' %s" %(out_path, file_type, url_i)
                        batch_ex_download = "wget -nd -e robots=off -A %s %s" %(
                            name, url_i + 'prcp_bc_gb2/' + name) 
                        subprocess.call(batch_ex_download, 
                                        cwd=self.inputPath, shell=True)
                    filename_out = str(date + '_' + hr)
                    print(datetime.now().strftime("%H:%M:%S"), filename_out)
                    # EXTRACT AND MERGE
                    # filename_in1 = 'gfs_4_' + date + '_' + hr + '_???'
                    batch_ex_filter = "cat geprcp.* | wgrib2 - -match '(:ens mean:)' -append -netcdf %s.nc" %(
                        filename_out)
                    subprocess.check_output(
                        batch_ex_filter, cwd=self.inputPath, shell=True)
                    # DELETE
                    batch_ex_delete = "rm geprcp.*"
                    subprocess.call(batch_ex_delete, 
                                    cwd=self.inputPath, shell=True)
                    
                break
            else:
                
                print(date, ' is not yet uploaded. Now trying to retrieve the run of the previous day.')
                continue

    def findTrigger(self):
        # Load (static) threshold values per station
        df_thresholds = pd.read_json(json.dumps(self.rainfall_triggers))

        # COMPARE WITH THE THRESHOLD
        grb_files = sorted([f for f in os.listdir(
            self.inputPath) if f.endswith('.nc')])[0]

        adm_shp = self.ADMIN_AREA_GDF
        west, south, east, north = self.bound_extent(adm_shp)

        lats = slice(south, north)  # 32, 22
        lons = slice(west, east)  # 24.5, 37

        # CREATE EMPTY VARIABLES FOR ANALYSIS
        grb_by_day = xr.DataArray()
        mean_by_day = xr.DataArray()


        file_dir = self.inputPath + grb_files
        grb = xr.open_dataset(file_dir)
        grb_clip = grb.sel(latitude=lats, longitude=lons) # clip grb with country extent

        #for leadtime in np.unique(df.leadTime.values):
            
        ## threshold (1 degree)
        df_leadtime = df_thresholds[df_thresholds.leadTime == self.leadTimeValue]
        geometry = [Point(xy) for xy in zip(
            df_leadtime.lon.astype(float), df_leadtime.lat.astype(float))]
        threshold_gdf = gpd.GeoDataFrame(df_leadtime, geometry=geometry)
        threshold_gdf.crs = {"init":"epsg:4326"}
        
        ## forecast (.5 degree)
        fc_by_day = grb_clip.sel(
            time=grb_clip.time.values[self.leadTimeValue]).to_dataframe().reset_index()
        geometry = [Point(xy) for xy in zip(
            fc_by_day.longitude.astype(float), fc_by_day.latitude.astype(float))]
        fc_gdf = gpd.GeoDataFrame(fc_by_day, geometry=geometry)
        fc_gdf.crs = {"init":"epsg:4326"}

        ## spatial join forecast and threshold and check if a location has rainfall exceeding the threshold
        compare_gdf = gpd.sjoin(fc_gdf, threshold_gdf, 
                                how='left', op='intersects')
        
        # interpolate NaN cells
        known = ~np.isnan(compare_gdf['leadTime'])
        unknown = ~known
        z = griddata((compare_gdf['longitude'][known], compare_gdf['latitude'][known]), 
                     compare_gdf['triggerLevel'][known], 
                     (compare_gdf['longitude'][unknown], compare_gdf['latitude'][unknown]))
        compare_gdf['triggerLevel'][unknown] = z.tolist()
        
        compare_gdf[str(str(self.leadTimeLabel)+'_pred')] = np.where(
            (compare_gdf['APCP_surface'] > compare_gdf['triggerLevel']), 1, 0)
        compare_gdf['time'] = compare_gdf['time'].astype(str)
        df_trigger = compare_gdf.filter(
            ['latitude','longitude','geometry',str(str(self.leadTimeLabel)+'_pred')])

        cube = make_geocube(vector_data=df_trigger, 
                            measurements=[str(str(self.leadTimeLabel)+'_pred')], 
                            resolution=(0.5, -0.5), output_crs="EPSG:4326")
        cube.rio.to_raster(self.rainrasterPath)

        print('Processed Rainfall data - File saved')


    def findTrigger_mock(self):
        # Load (static) threshold values per station

        df_thresholds = pd.read_json(json.dumps(self.rainfall_triggers))

        ### COMPARE WITH THE THRESHOLD
        grb_files = sorted([f for f in os.listdir(self.inputPath) if f.endswith('.grb2')])

        ### COUNTRY SETTINGS
        # country_code = 'egy'
        adm_shp = self.ADMIN_AREA_GDF

        west, south, east, north = self.bound_extent(adm_shp)

        lats = slice(north, south)  # 32, 22
        lons = slice(west, east)  # 24.5, 37

        ### CREATE EMPTY VARIABLES FOR ANALYSIS
        grb_by_day = xr.DataArray()
        mean_by_day = xr.DataArray()

        ###  COMPARE THE THRESHOLD WITH AVERAGE OF ALL RUN CYCLES OF THE DAY (2 LEADTIMES X 1 AVG)
        for file in grb_files:
            file_dir = self.inputPath + file
            # grb = pygrib.open(file_dir)
            grb = xr.open_dataset(file_dir, engine='cfgrib')
            grb_clip = grb.sel(latitude=lats, longitude=lons)  # clip grb with country extent
            runcycle = str(grb_clip.time.dt.year.values) + \
                       '%02d' % grb_clip.time.dt.month.values +\
                       '%02d' % grb_clip.time.dt.day.values +\
                       '%02d' % grb_clip.time.dt.hour.values
            # grb_clip.rolling(step=accum_duration, center=False).sum()
            fc_dayrange = np.unique(pd.to_datetime(grb_clip.valid_time.values).date)
            grb_24hrs = grb_clip.groupby(grb_clip.valid_time.dt.day).sum().drop(
                labels=['time', 'surface'])  # sum rainfall by day

            for fc_day in fc_dayrange:  # grb_24hrs.day.values:
                # fc_day = np.datetime64(str(grb_clip.time.dt.year.values) +
                # '-' + str(grb_clip.time.dt.month.values) + '-' + str(day))
                # print(fc_day)
                if len(grb_by_day.coords) == 0:
                    grb_by_day = grb_24hrs.sel(day=fc_day.day).rename({'tp': 'tp_%s' % runcycle}).assign_coords(
                        fc_day=fc_day).expand_dims('fc_day').drop(labels='day')
                else:
                    grb_by_day = xr.combine_by_coords([grb_by_day, grb_24hrs.sel(day=fc_day.day).rename(
                        {'tp': 'tp_%s' % runcycle}).assign_coords(fc_day=fc_day).expand_dims('fc_day').drop(
                        labels='day')])

        mean_by_day = grb_by_day.to_array(dim='tp_mean_by_day').mean('tp_mean_by_day').rename('mean_by_day')
        # sd_by_day = grb_by_day.to_array(dim='tp_sd_by_day').std('tp_sd_by_day')
        # mean_by_day = xr.combine_by_coords([mean_by_day, sd_by_day])

        # runcycle_day = str(grb_clip.time.dt.year.values) + '%02d'%grb_clip.time.dt.month.values + '%02d'%grb_clip.time.dt.day.values

        # for leadtime in np.unique(df_thresholds.leadTime.values):

        ## threshold (1 degree)
        df_leadtime = df_thresholds[df_thresholds.leadTime == self.leadTimeValue]
        geometry = [Point(xy) for xy in zip(df_leadtime.lon.astype(float), df_leadtime.lat.astype(float))]
        threshold_gdf = gpd.GeoDataFrame(df_leadtime, geometry=geometry).set_crs("EPSG:4326")

        ## forecast (.5 degree)
        fc_by_day = mean_by_day.sel(fc_day=mean_by_day.fc_day.values[self.leadTimeValue]).to_dataframe().reset_index()
        geometry = [Point(xy) for xy in zip(fc_by_day.longitude.astype(float), fc_by_day.latitude.astype(float))]
        fc_gdf = gpd.GeoDataFrame(fc_by_day, geometry=geometry).set_crs("EPSG:4326")

        ## spatial join forecast and threshold and check if a location has rainfall exceeding the threshold
        compare_gdf = gpd.sjoin(fc_gdf, threshold_gdf, how='left', op='intersects')

        # interpolate NaN cells
        known = ~np.isnan(compare_gdf['leadTime'])
        unknown = ~known
        z = griddata((compare_gdf['longitude'][known], compare_gdf['latitude'][known]),
                     compare_gdf['triggerLevel'][known],
                     (compare_gdf['longitude'][unknown], compare_gdf['latitude'][unknown]))
        compare_gdf['triggerLevel'][unknown] = z.tolist()

        compare_gdf[str(str(self.leadTimeLabel) + '_pred')] = np.where(
            (compare_gdf['mean_by_day'] > compare_gdf['triggerLevel']), 1, 0)
        compare_gdf['fc_day'] = compare_gdf['fc_day'].astype(str)
        df_trigger = compare_gdf.filter(['latitude', 'longitude', 'geometry', str(str(self.leadTimeLabel) + '_pred')])

        # out = df_trigger.to_json()
        # output_name = '%s_%sday_'%(runcycle_day, self.leadTimeLabel) + 'triggerLevel'
        # with open(self.triggersPerStationPath, 'w') as fp:
        #     fp.write(out)
            
        cube = make_geocube(vector_data=df_trigger, measurements=[str(str(self.leadTimeLabel)+'_pred')], resolution=(-0.5, 0.5), align=(0.25, 0.25), output_crs="EPSG:4326")
        cube.rio.to_raster(self.rainrasterPath)
        
        print('Processed Rainfall data - File saved')