##########################################################################################
# Overview
##########################################################################################
"""
Date: July 2020
Authors: Lisanne van Brussel (lisanne.van.brussel@vodw.ey.com)

This class will load GloFAS discharge data per gridcell (0.1x0.1 degree).
"""


workdirectory_scripts = 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis\\floodcorrelation'

##################################################################
# Importers
##################################################################

import pandas as pd
import numpy as np
import os
from datetime import datetime
from netCDF4 import Dataset

os.chdir(workdirectory_scripts)
cfg = __import__('0_config')


class ReadData:
    """
    ReadGloFAS discharge data per gridcell (0.1x0.1 degree).
    
    Parameters
    ----------
    _read_merge_data
        
    _read_raw_data
       
        This is theoretically fastest, but defunct as of December 2019. 
    
    verbose
        Whether to print debug information about the current activities. 
        
    Attributes
    ----------
    df_dis_gridcells : pd.DataFrame
        DataFrame containing GloFAS data with discharge levels per coordinates.
        Column_names are 'lat_lon', each row is a new day.
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

        
        # Get GloFAS files
        self.GloFAS_files = os.listdir(self.path_glofas_discharge)
        
        
        # Read all data and merge it to one pandas dataframe
        self.df_discharge = self._read_merge_data()
    
    
    def __repr__(self) -> None:
        """Print method."""
        return('GloFAS data Read-in object.\n' +
               'Data shape: ' + str(self.data.shape) +
               '\nCreated at: ' + str(self.created_at))
        

    def _read_merge_data(self):
        """
        TBD
        """
        # Set workdirectory
        os.chdir(self.path_glofas_discharge)
        
        # Select number of files
        if self.nr_files: 
            load_files = self.GloFAS_files[0:self.nr_files]
        else: 
            load_files = load_files = self.GloFAS_files
        
        # Load and merge grid cell data
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
        df_dis_gridcells['date'] = df_dis_gridcells['date'].apply(lambda x: datetime.strptime(x, '%Y-%m-%d')).dt.date
                
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
        lat = list(np.round(glofas_nc.variables['lat'][:],2))
        lon = list(np.round(glofas_nc.variables['lon'][:],2))
        discharge = glofas_nc.variables ['dis24'] [:]
        
        # Create dataframe with x,y,pixel colours, flood yes(1)/no(0)
        #data_discharge = pd.DataFrame(columns=['lat', 'long', 'discharge', 'date'])
        year = file[0:4]
        month = file.split('_')[1]
        
        # Fill dataframe with discharge levels per day, columns are latitude_longitude
        for lat_val in np.arange(self.lat_min, self.lat_max, self.steps_coordinates):
            lat_val = np.round(lat_val,2)
            for lon_val in np.arange(self.lon_min, self.lon_max, self.steps_coordinates):
                lon_val = np.round(lon_val, 2)
                if lon_val in lon and lat_val in lat:
                     df[str(lat_val)+'_'+str(lon_val)] = np.ma.filled(discharge[:,
                                                                    lat.index(lat_val),
                                                                    lon.index(lon_val)])
        
        # Add date columns
        df['year'] = year
        df['month'] = month
        df['day'] = df.index+1
        
        return(df)



