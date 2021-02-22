##########################################################################################
# Overview
##########################################################################################
"""
Date: July 2020
Authors: Lisanne van Brussel (lisanne.van.brussel@vodw.ey.com)

This class will load GloFAS discharge data per gridcell (0.1x0.1 degree). 
Besides, all files will be merged to one pandas DataFrame (rows=days, columns = 'lat_lon').
"""

##################################################################
# Set workdirectory
##################################################################

# Set workdirectory to folder of scripts
workdirectory_scripts = 'c:\\Users\\BOttow\\Documents\\IBF-system\\trigger-model-development\\flood\\trigger-model\\glofas_station_selection_tool\\'

##################################################################
# Importers
##################################################################

import pandas as pd
import numpy as np
import os
from datetime import datetime
from netCDF4 import Dataset
import geopandas

# Set workdirectory and 
os.chdir(workdirectory_scripts)

# Import configuration
cfg = __import__('0_config')

##################################################################
# Create class ReadData()
##################################################################

class ReadData:
    """
    Read GloFAS discharge data per gridcell (0.1x0.1 degree).
    
    Parameters
    ---------- 
    verbose
        Whether to print debug information about the current activities. 
        
    Attributes
    ---------- 
    df_dis_gridcells : pd.DataFrame
        DataFrame containing GloFAS data with discharge levels per coordinates.
        Column_names are 'lat_lon', each row is a new day.
        
    Functions
    ----------
    _read_merge_data
        Merges all monthly GloFAS data to one pandas dataframe.
        
    _read_raw_data  
        Reads one specific nc file for the given lon/lat boundary boxes.
        Returns a pandas dataframe.  
        
    _read_transform_shp_json
        Reads in a shapefile and transforms and saves it to a json.
    """ 
    
    
    def __init__(self, 
                 verbose: bool = True):
        
        self.created_at = datetime.now()
        self.verbose = verbose
        
        self.cfg = cfg.cfg
        
        # Specify elements from configuration.
        self.path_glofas_discharge = self.cfg['path_discharge_gridcells']
        self.nr_files = self.cfg['nr_files']
        self.lat_min = self.cfg['lat_min']
        self.lat_max = self.cfg['lat_max']
        self.lon_min = self.cfg['lon_min']
        self.lon_max = self.cfg['lon_max']
        self.steps_coordinates = self.cfg['steps_coordinates']
        self.path_shp_rivers = self.cfg['path_shp_rivers']
        self.file_shp_rivers = self.cfg['file_shp_rivers']
        self.path_shp_admin_boundaries = self.cfg['path_shp_admin_boundaries']
        self.file_shp_admin_boundaries = self.cfg['file_shp_admin_boundaries']        
        
        # Get GloFAS files
        self.GloFAS_files = os.listdir(self.path_glofas_discharge)
        
        # Read all data and merge it to one pandas dataframe
        self.df_discharge = self._read_merge_data()
    
        # Read in shapefiles, transform + saves to json
        # Rivers
        self._read_transform_shp_json(path = self.path_shp_rivers,
                                      file = self.file_shp_rivers)
        # Admin boundaries
        self._read_transform_shp_json(path = self.path_shp_admin_boundaries,
                                      file = self.file_shp_admin_boundaries)
        
        
    def _read_merge_data(self):
        """
        Uses _read_raw_data to read in .nc-files with GloFAS discharge data (one file per month).
        Merges all files (of self.GloFAS files) into one pandas DataFrame, where rows: days,
        columns: coordinates of gridcell ('lat_lon').
        
        Output: pandas.DataFrame with all GloFAS discharge data.
        """
        # Set workdirectory
        os.chdir(self.path_glofas_discharge)
        
        # Select number of files
        if self.nr_files: 
            load_files = self.GloFAS_files[0:self.nr_files]
        else: 
            load_files = load_files = self.GloFAS_files
        
        # Load and merge GloFAS grid cell data
        # Iterates over the (monthly data) files
        for i,file in enumerate(load_files):
        
            if i == 0:
                df_dis_gridcells = self._read_raw_data(file = file,
                                                        df = pd.DataFrame()) 
                
                if self.verbose: print('Loaded and extracted: ' + file)
                
            else: 
                df_new = self._read_raw_data(file = file,
                                           df = pd.DataFrame())            
                df_dis_gridcells = pd.concat([df_dis_gridcells, df_new], axis=0, sort=False)
                
                if self.verbose: print('Loaded and extracted: ' + file)
                
        # Transform date variables
        df_dis_gridcells['day'] = df_dis_gridcells['day'].astype(str).apply(lambda x: x.zfill(2))
        df_dis_gridcells['month'] = df_dis_gridcells['month'].astype(str).apply(lambda x: x.zfill(2))
        df_dis_gridcells['date'] = df_dis_gridcells['year'] +'-' + df_dis_gridcells['month']+'-'+df_dis_gridcells['day']
        df_dis_gridcells['date'] = df_dis_gridcells['date'].apply(lambda x: datetime.strptime(x, '%Y-%m-%d'))
                
        if self.verbose: print('All files downloaded and concatenated')      
        
        return(df_dis_gridcells)
        
        
    def _read_raw_data(self,
                       file: str = None,
                       df: pd.DataFrame = pd.DataFrame()             
                       ):
        
        """
        Reads one specific nc file for the given lon/lat boundary boxes.
        Returns a pandas dataframe.
        """
        
        #Load dataset  
        glofas_nc = Dataset(file)
        lat = list(np.round(glofas_nc.variables['latitude'][:],2))
        lon = list(np.round(glofas_nc.variables['longitude'][:],2))
        discharge = glofas_nc.variables ['dis24'] [:]
        
        # Select the year and month based on file name
        year = file[0:4]
        month = file.split('_')[1]
        
        # Fill dataframe with discharge levels per day, columns are latitude_longitude
        for lat_val in np.arange(self.lat_min, self.lat_max, self.steps_coordinates):
            lat_val = np.round(lat_val,2)
            for lon_val in np.arange(self.lon_min, self.lon_max, self.steps_coordinates):
                lon_val = np.round(lon_val, 2)
                if np.any(lon == lon_val) and np.any(lat == lat_val):
                     df[str(lat_val)+'_'+str(lon_val)] = np.ma.filled(discharge[:,
                                                                    lat.index(lat_val),
                                                                    lon.index(lon_val)])
        
        # Add date columns
        df['year'] = year
        df['month'] = month
        df['day'] = df.index+1
        
        return(df)
    
    def _read_transform_shp_json(self,
                                path: str = None,
                                file: str = None         
                               ):
        """
        Reads shapefile and transforms it to json
        """
        
        # Read in data
        self.myshpfile = geopandas.read_file(path+file)
        # Save as json
        name = file.replace('.shp', '.json')
        self.myshpfile.to_file(path+name, driver='GeoJSON')
        
        if self.verbose: print('Transformed file to: ' + path + name)
        
        



