import os
import xarray as xr
import numpy as np
import pandas as pd
from pandas import DataFrame
import logging
import urllib.request
import urllib.error
import time
from lib.logging.logglySetup import logger
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

    def __init__(self, leadTimeLabel, leadTimeValue, country_code, admin_area_gdf, rainfall_triggers):
        self.leadTimeLabel = leadTimeLabel
        self.leadTimeValue = leadTimeValue
        self.country_code = country_code
        self.inputPath = PIPELINE_DATA + 'input/rainfall/'
        self.rainrasterPath = GEOSERVER_OUTPUT + \
            '0/rainfall_extents/rain_rp_' + leadTimeLabel + '_' + country_code + '.tif'
        self.rainfall_triggers = rainfall_triggers
        self.ADMIN_AREA_GDF = admin_area_gdf
        self.downloaded = False

    def process(self):
        if not self.downloaded:
            self.removeOldForecastData()
            self.download()
        self.findTrigger()

    def removeOldForecastData(self):
        os.makedirs(self.inputPath, exist_ok=True)
        for f in [f for f in os.listdir(self.inputPath)]:
            os.remove(os.path.join(self.inputPath, f))

    def download(self):
        if SETTINGS_SECRET[self.country_code]['mock'] == True:
            self.inputPath = PIPELINE_DATA + 'input/rainfall_dummy/'

        else:
            downloadDone = False

            timeToTryDownload = 43200
            timeToRetry = 600

            start = time.time()
            end = start + timeToTryDownload

            while downloadDone == False and time.time() < end:
                try:
                    self.download_GFS_forecast()
                    downloadDone = True
                    self.downloaded = True
                except urllib.error.URLError:
                    logger.info(
                        "GFS download failed. "
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

    def download_GFS_forecast(self):

        all_url = self.listFD(GFS_SOURCE, ext='')
        gfs_url = sorted([i for i in all_url if i.split(
            '/')[-2].startswith('gfs.')], reverse=True)
        fc_hrs = np.arange(3, 195, 3)

        for url_date in gfs_url:
            date = url_date.split('/')[-2][4:]
            hour_url = self.listFD(url_date, ext='')

            if len(hour_url) == 5:  # check if there are all 4 runcycle + parent directory in the hour_url

                for url_i in hour_url[1:]:
                    url_list = self.listFD(url_i, ext='')
                    hr = url_i.split('/')[-2]
                    filename_in = ['gfs.t' + hr + 'z.pgrb2.0p50.f' +
                                   '%03d' % fc_hr for fc_hr in fc_hrs]

                    for name in filename_in:
                        # DOWNLOAD ALL GRB2 FILES OF THE DATE
                        batch_ex_download = "wget -nd -e robots=off -A %s %s" % (
                            name, url_i + 'atmos/' + name)
                        subprocess.call(batch_ex_download,
                                        cwd=self.inputPath, shell=True)
                    filename_out = str(date + '_' + hr)
                    print(datetime.now().strftime("%H:%M:%S"), filename_out)
                    # EXTRACT AND MERGE
                    batch_ex_filter = "cat gfs.* | wgrib2 - -match '(:APCP:)' -ncep_norm %s.grb2" % (
                        filename_out)
                    subprocess.check_output(
                        batch_ex_filter, cwd=self.inputPath, shell=True)
                    # DELETE
                    batch_ex_delete = "rm  gfs.*"
                    subprocess.call(batch_ex_delete,
                                    cwd=self.inputPath, shell=True)

                break
            else:
                print(
                    date, ' does not have all run cycles. Now trying the runs of the previous day.')
                continue

    def findTrigger(self):
        logging.info("Started processing glofas data: " + self.leadTimeLabel)

        # Load (static) threshold values per pixel
        df_thresholds = pd.read_json(json.dumps(self.rainfall_triggers))

        # COMPARE WITH THE THRESHOLD
        grb_files = sorted([f for f in os.listdir(
            self.inputPath) if f.endswith('.grb2')])

        adm_shp = self.ADMIN_AREA_GDF
        west, south, east, north = self.bound_extent(adm_shp)

        lats = slice(north, south)  # 32, 22
        lons = slice(west, east)  # 24.5, 37

        # CREATE EMPTY VARIABLES FOR ANALYSIS
        grb_by_day = xr.DataArray()
        mean_by_day = xr.DataArray()

        # COMPARE THE THRESHOLD WITH AVERAGE OF ALL RUN CYCLES OF THE DAY (2 LEADTIMES X 1 AVG)
        for file in grb_files:
            file_dir = self.inputPath + file
            grb = xr.open_dataset(file_dir, engine='cfgrib')
            # clip grb with country extent
            grb_clip = grb.sel(latitude=lats, longitude=lons)
            runcycle = str(grb_clip.time.dt.year.values) + \
                '%02d' % grb_clip.time.dt.month.values +\
                '%02d' % grb_clip.time.dt.day.values +\
                '%02d' % grb_clip.time.dt.hour.values
            fc_dayrange = np.unique(pd.to_datetime(
                grb_clip.valid_time.values).date)
            grb_24hrs = grb_clip.groupby(grb_clip.valid_time.dt.day).sum().drop(
                labels=['time', 'surface'])  # sum rainfall by day

            for fc_day in fc_dayrange:
                if len(grb_by_day.coords) == 0:
                    grb_by_day = grb_24hrs.sel(day=fc_day.day).rename({'tp': 'tp_%s' % runcycle}).assign_coords(
                        fc_day=fc_day).expand_dims('fc_day').drop(labels='day')
                else:
                    grb_by_day = xr.combine_by_coords([grb_by_day, grb_24hrs.sel(day=fc_day.day).rename(
                        {'tp': 'tp_%s' % runcycle}).assign_coords(fc_day=fc_day).expand_dims('fc_day').drop(
                        labels='day')])

        mean_by_day = grb_by_day.to_array(dim='tp_mean_by_day').mean(
            'tp_mean_by_day').rename('mean_by_day')

        # threshold (1 degree)
        df_leadtime = df_thresholds[df_thresholds[LEAD_TIME] == self.leadTimeValue]
        geometry = [Point(xy) for xy in zip(
            df_leadtime.lon.astype(float), df_leadtime.lat.astype(float))]
        threshold_gdf = gpd.GeoDataFrame(
            df_leadtime, geometry=geometry).set_crs("EPSG:4326")

        # forecast (.5 degree)
        fc_by_day = mean_by_day.sel(
            fc_day=mean_by_day.fc_day.values[self.leadTimeValue]).to_dataframe().reset_index()
        geometry = [Point(xy) for xy in zip(
            fc_by_day.longitude.astype(float), fc_by_day.latitude.astype(float))]
        fc_gdf = gpd.GeoDataFrame(
            fc_by_day, geometry=geometry).set_crs("EPSG:4326")

        # spatial join forecast and threshold and check if a location has rainfall exceeding the threshold
        compare_gdf = gpd.sjoin(fc_gdf, threshold_gdf,
                                how='left', op='intersects')

        # interpolate NaN cells
        known = ~np.isnan(compare_gdf[LEAD_TIME])
        unknown = ~known
        z = griddata((compare_gdf['longitude'][known], compare_gdf['latitude'][known]),
                     compare_gdf[TRIGGER_LEVEL][known],
                     (compare_gdf['longitude'][unknown], compare_gdf['latitude'][unknown]))
        compare_gdf[TRIGGER_LEVEL][unknown] = z.tolist()

        compare_gdf[str(str(self.leadTimeLabel) + '_pred')] = np.where(
            (compare_gdf['mean_by_day'] > compare_gdf[TRIGGER_LEVEL]), 1, 0)
        compare_gdf['fc_day'] = compare_gdf['fc_day'].astype(str)
        df_trigger = compare_gdf.filter(
            ['latitude', 'longitude', 'geometry', str(str(self.leadTimeLabel) + '_pred')])

        cube = make_geocube(vector_data=df_trigger, measurements=[str(str(
            self.leadTimeLabel)+'_pred')], resolution=(-0.5, 0.5), align=(0.25, 0.25), output_crs="EPSG:4326")
        cube.rio.to_raster(self.rainrasterPath)

        print('Processed Rainfall data - File saved')
