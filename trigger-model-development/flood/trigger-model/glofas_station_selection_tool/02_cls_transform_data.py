##########################################################################################
"""
Date: July 2020
Authors: Lisanne van Brussel (lisanne.van.brussel@vodw.ey.com)

This class will transform GloFAS discharge data and determines the coherence of areas/grid cells. 
"""


##################################################################
# Run classes
##################################################################

import os
import pandas as pd
import numpy as np

workdirectory_scripts = 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis\\floodcorrelation'
os.chdir(workdirectory_scripts)
gd = __import__('01_cls_read_data')

rd = gd.ReadData()



class TransformDataConnectAreas:
    """
    TBD
    """
    
    def __init__(self,
                 verbose: bool = True):
        """
        TBD
        """
        
        self.verbose = verbose
        
        # Get settings from config
        self.percentile = rd.cfg['percentile']
        self.neighbour_rounds = rd.cfg['neighbour_rounds']
        self.min_perc_coherence = rd.cfg['min_perc_coherence']
        self.country = rd.cfg['country']
        self.save_final_data = rd.cfg['save_final_data']
        self.path_save_data = rd.cfg['path_save_data']
        
        # get data
        self.df_discharge = rd.df_discharge.copy()
        
        # Transform data to numeric (based on percentiles of grid cell)
        self._data_to_numeric_threshold(data=self.df_discharge)
        
        # Dataframe with the percentage overlap in past 10 years (row = selected cell, columns = neighbours)
        self.perc_both_extremes = pd.DataFrame()
        
        # Get and store neighbours of grid cell of interest that have a strong relation
        self.dct_coherence_areas = {}
        self._find_strong_coherence_neighbours()
        
        # Save data
        if self.save_final_data:
            # Percentage overlap data
            path_name = self.path_save_data + 'df_' + self.country + '_percentages_10yr_'+ str(100*self.percentile) + 'percentile.csv'
            self.perc_both_extremes.to_csv(path_name)
            # Discharge data
            path_discharge =  self.path_save_data + 'df_' + self.country + '_discharge_10yr.csv'
            df_discharge_save = self.df_discharge.set_index('date').drop(columns=['month', 'year', 'day'], axis=1)
            df_discharge_save.to_csv(path_discharge)
            # Numeric/dummy data with extreme discharges
            path_numeric =  self.path_save_data + 'df_' + self.country + '_dummy_extreme_discharge_'+ str(100*self.percentile) + 'percentile.csv'
            self.data_numeric.to_csv(path_numeric)     
            print('Three dataframes of ', self.country, ' saved in ', self.path_save_data)
        
        
    def _data_to_numeric_threshold(self,
                                   data : pd.DataFrame() = None,
                                  vars_drop: list = ['year', 'month', 'day']
                                  ):
        """
        Drop unneccessary variables and identify extreme discharge level for each grid cell, each day.
        Create a numeric (dummy) dataframe where 1 is an extreme discharge level for that specific grid cell.
        Returns a dummy/numeric dataframe
        """ 
        
        # Selection of data and set date as index
        data = data[[x for x in data if x not in vars_drop]].set_index('date')
    
        # Get percentiles per column 
        self.df_percentile_thresholds = pd.DataFrame(data.quantile(q=self.percentile, 
                                                                   axis=0,
                                                                   interpolation='linear')).T.reset_index(drop=True)
    
        # Copy dataframe to numeric
        self.data_numeric = data.copy()
        
        # Identify values for each grid cell that are larger than the corresponding 'threshold' of the specific grid cell
        for c in self.data_numeric.columns:
            self.data_numeric[c] = np.where(self.data_numeric[c].values > self.df_percentile_thresholds[c].values , 1, 0)
            
    
    def _find_strong_coherence_neighbours(self):
        """
        TBD
        """
        
        # Select lon/lat coordinates of grid cell of interest
        for i,c in enumerate(self.data_numeric.columns):
            
            if self.verbose: print('\n location of area of interest ', c)
            
            # Select latitude and longitude 
            lat_interest = round(float(c.split('_')[0]),2)
            lon_interest = round(float(c.split('_')[1]),2)
            
            # Find neighbours, based on rounds of neighbours around
            lon_lat_steps = self.neighbour_rounds/10
            
            # Get all possible lon/lat values of neighbours
            # +0.0001 is needed to include the last value for coordinates in (-1,1)
            lat_range = np.arange(lat_interest -  lon_lat_steps, lat_interest + lon_lat_steps + 0.0001, 0.1)
            lon_range = np.arange(lon_interest -  lon_lat_steps, lon_interest + lon_lat_steps + 0.0001, 0.1)
            
            # Find all combinations
            combis_coordinates = [str(round(lat,2))+'_'+str(round(lon,2)) for lat in lat_range for lon in lon_range]
            
            # Select data of neighbours
            combis_coord_available = [x for x in combis_coordinates if x in self.data_numeric.columns]
            data_neighbours = self.data_numeric[combis_coord_available]
            
            if self.verbose: print('data_neighbours shape is ', data_neighbours.shape)        
                   
            # Percentage of both extreme values in cell of interest and neighbours
            data_extremes = data_neighbours[data_neighbours[c]==1]
            perc_both_extremes = pd.DataFrame(100*data_extremes.groupby(c).sum()/data_extremes.shape[0])

    	    # Add new row with data with neighbour similarity percentages to dataframe
            if i == 0:
                # Change name index (to coordinates)
                self.perc_both_extremes = perc_both_extremes.rename({1: c}, axis='index')
            else :
                perc_both_extremes_ren = perc_both_extremes.rename({1: c}, axis='index')
                self.perc_both_extremes = pd.concat([self.perc_both_extremes, perc_both_extremes_ren])
        
        # Sort data        
        self.perc_both_extremes = self.perc_both_extremes.sort_index(ascending=False)

  
        
        

        
        
        
        
        
        