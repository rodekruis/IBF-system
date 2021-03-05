import os
import pandas as pd
from pandas import DataFrame
import json
import logging
import geopandas as gpd
import rasterio
from rasterio.merge import merge

from lib.cronJob.exposure import Exposure
from lib.logging.logglySetup import logger
from settings import *

class FloodExtent:

    """Class used to calculate flood extent"""

    def __init__(self, fcStep, days, country_code, district_mapping = None, district_cols = None):
        self.fcStep = fcStep
        self.days = days
        self.country_code = country_code
        self.inputPath = GEOSERVER_INPUT + "flood_extent/"
        self.outputPathAreas = PIPELINE_OUTPUT + 'flood_extents/'+ fcStep +'/'
        if SETTINGS[country_code]['model'] == 'glofas':
            self.outputPathMerge = GEOSERVER_OUTPUT + '0/flood_extents/flood_extent_'+ fcStep + '_' + country_code + '.tif'
        elif SETTINGS[country_code]['model'] == 'rainfall':
            self.outputPathMerge = GEOSERVER_OUTPUT + '0/rainfall_extents/rain_rp_'+ fcStep + '_' + country_code + '.tif'
        self.statsPath = PIPELINE_OUTPUT + 'calculated_affected/affected_' + fcStep + '_' + country_code + '.json'
        self.EXPOSURE_DATA_SOURCES = SETTINGS[country_code]['EXPOSURE_DATA_SOURCES']
        self.district_mapping = district_mapping
        self.district_cols = district_cols
        self.ADMIN_BOUNDARIES = PIPELINE_INPUT + SETTINGS[country_code]['admin_boundaries']['filename']
        self.PCODE_COLNAME = SETTINGS[country_code]['admin_boundaries']['pcode_colname']
        self.stats = []

    def calculate(self):
        admin_gdf = self.loadVectorData()

        df_glofas = self.loadGlofasData()

        logging.info("Create flood extent for %s",  self.fcStep)

        logging.info('\nMaking flood extent - '+ self.fcStep+'\n')

        #Create new subfolder for current date
        if not os.path.exists(self.outputPathAreas):
            os.makedirs(self.outputPathAreas)
        for the_file in os.listdir(self.outputPathAreas):
            file_path = os.path.join(self.outputPathAreas, the_file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(e)
        

        #Loop through catchment-areas and clip right flood extent
        for index, rows in df_glofas.iterrows():
            #Filter the catchment-area GDF per area
            pcode = rows['pcode']
            gdf_dist = admin_gdf[admin_gdf[self.PCODE_COLNAME] == pcode]
            dist_coords = self.getCoordinatesFromGDF(gdf_dist)
            
            #If trigger, find the right flood extent and clip it for the area and save it
            trigger = rows['fc_trigger']
            if trigger == 1:
                return_period = rows['fc_rp'] 
                input_raster = self.inputPath + self.country_code + '_flood_' +str(int(return_period))+'year.tif'
            else:
                input_raster = self.inputPath + self.country_code + '_flood_empty.tif'

            out_image, out_meta = self.clipTiffWithShapes(input_raster, dist_coords)

            with rasterio.open(self.outputPathAreas+ 'pcode_' + str(pcode) + ".tif", "w", **out_meta) as dest:
                dest.write(out_image)


        #Merge all clipped flood extents back together and Save
        mosaic, out_meta = self.mergeRasters()

        
        with rasterio.open(self.outputPathMerge, "w", **out_meta) as dest:
            dest.write(mosaic)
            print("Total flood extent file written")
            

        
    def reproject_file(self, gdf, file_name, force_epsg):

        print("Reprojecting %s to EPSG %i...\n" % (file_name, force_epsg), end="", flush=True)
        gdf = gdf.to_crs(epsg=force_epsg)

        return gdf

    def loadVectorData(self):

        admin_file = self.ADMIN_BOUNDARIES
        admin_gdf = gpd.GeoDataFrame()
        try:
            admin_gdf = gpd.GeoDataFrame.from_file(admin_file)
        except IOError as ioe:
            print("Could not load admin-file properly", end="", flush=True)
        
        return admin_gdf

    def loadGlofasData(self):

        #Load assigned station per district
        df_district_mapping = DataFrame(self.district_mapping)
        df_district_mapping.columns = self.district_cols

        #Load (static) threshold values per station
        path = PIPELINE_DATA+'output/triggers_rp_per_station/triggers_rp_' + self.fcStep + '_' + self.country_code + '.json'
        df_triggers = pd.read_json(path, orient='records')
        
        #Merge two datasets
        df_glofas = pd.merge(df_district_mapping, df_triggers, left_on='station_code_'+str(self.days)+'day', right_on='station_code', how='left')

        return df_glofas

    def getCoordinatesFromGDF(self, gdf):
        """Function to parse features from GeoDataFrame in such a manner that rasterio wants them"""
        return [json.loads(gdf.to_json())['features'][0]['geometry']]

    def clipTiffWithShapes(self, tiffLocaction, shapes):
        with rasterio.open(tiffLocaction) as src:
            outImage, out_transform = rasterio.mask.mask(src, shapes, crop=True)
            outMeta = src.meta.copy()
        outMeta.update({"driver": "GTiff",
                    "height": outImage.shape[1],
                    "width": outImage.shape[2],
                    "transform": out_transform})

        return outImage, outMeta

    def mergeRasters(self):
        src_files_to_mosaic = []
        for fp in os.listdir(self.outputPathAreas):
            src = rasterio.open(self.outputPathAreas+fp)
            src_files_to_mosaic.append(src)
        if len(src_files_to_mosaic) > 0:
            mosaic, out_trans = merge(src_files_to_mosaic)
            out_meta = src.meta.copy()
            out_meta.update({"driver": "GTiff",
                            "height": mosaic.shape[1],
                            "width": mosaic.shape[2],
                            "transform": out_trans,
                        })
        return mosaic, out_meta


    def callAllExposure(self):
        logger.info('Started calculating affected of %s', self.outputPathMerge)

        print(self.fcStep, " - fcStep")

        for indicator, values in self.EXPOSURE_DATA_SOURCES.items():
            print('indicator: ', indicator)


            exposure = Exposure(indicator, values['source'], values['rasterValue'], self.fcStep, self.country_code, self.district_mapping, self.district_cols)
            exposure.calcAffected(self.outputPathMerge)

            for item in exposure.stats:
                self.stats.append(item)

        with open(self.statsPath, 'w') as fp:
            json.dump(self.stats, fp)
            logger.info("Saved stats for %s", self.statsPath)
            