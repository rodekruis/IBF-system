# -*- coding: utf-8 -*-
"""
Created on Sun Oct 20 20:24:03 2019

@authors: ABucherie
"""
# this script objective is to extract and analyse Glofas historical data for specific stations, against flood impact events at district level
# and to compute the prediction performance of a model using only Glofas discharge thresholds.

#%%
# setting up your environment
import sys
sys.path.append("scripts")
import xarray as xr
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os
from os import listdir
from os.path import isfile, join
import seaborn as sns
import geopandas as gpd
from shapely.geometry import Point
from pandas.plotting import register_matplotlib_converters
register_matplotlib_converters()
import datetime
from sklearn.metrics import confusion_matrix
import datetime as dt   # Python standard library datetime  module
from database_utils import get_glofas_data # utility functions to access database
from pathlib import Path

#%%
# Change per country
country = 'Uganda'    # 'Kenya'
ct_code = 'uga'  # for instance 'ken'for Kenya

# Path name to the folder and local path
my_local_path = str(Path(os.getcwd()))
path = my_local_path + '/' + country + '/'

# Read the path to the relevant admin level shape to use for the study
Admin = path + 'input/Admin/uga_admbnda_adm1_UBOS_v2.shp'     #activate for Uganda
#Admin= path + 'input/Admin/KEN_adm1_mapshaper_corrected.shp' # activate for Kenya

#%% functions definition 

#Creating a fonction to normalize result
def normalize(df):
    result = df.copy()
    for feature_name in df.columns:
        max_value = df[feature_name].max()
        min_value = df[feature_name].min()
        result[feature_name] = (df[feature_name] - min_value) / (max_value - min_value)
    return result

# Fonction to compute confusion matrix (hits, false_al, misses, correct negatives) and performance indexes (FAR, POD, POFD, CSI)):
# Methodology adapted taking into account the consecutive day above thresholds as a unique flood period
# hits:              nb of peak period above thresholds that have at least one observation day within the period
# false alarm :      number of peak above threshold(consecutive day above discharge threshold as an event), minus the number of hits
# misses :           number of observed flood events no in a discharge peak period o above threshold
# correct negative : forcing the correct negative number to be the same than the number of observed flood events (misses + hits)

def calc_performance_scores(obs, pred):
    df= pd.DataFrame({'cons_class': pred.diff().ne(0).cumsum(), 'hits':(obs==1) & (pred ==1)})
    hits= df[['cons_class','hits' ]].drop_duplicates().hits[df.hits == True].count()
    false_al = (pred.loc[pred.shift() != pred].sum()) - hits 
    misses = sum((obs == 1) & (pred ==0))
    corr_neg = misses + hits
    
    output = {}
    output['pod'] = hits / (hits + misses)
    output['far'] = false_al / (hits + false_al)
    output['pofd'] = false_al / (false_al + corr_neg)
    output['csi'] = hits / (hits + false_al + misses)
    
    output = pd.Series(output)
    return output


def threshold_optimize(station,weight_far=0.5):
   performance_df=pd.DataFrame(columns=['district', 'station', 'pod','far','pofd','csi','threshold'])
   best = 1
   starting_value = 0.5
   ending_value = 0.95
   increment = 0.05
   value_check = starting_value
   while (value_check <= ending_value):
       discharge_threshold = np.quantile(extreme_dis,value_check)
       df_dis=pd.DataFrame(columns=['station','time', 'dis', 'max_dt_3days'])
       df_dis['time']= di[station]['time'].values
       df_dis['dis']= pd.Series(di[station].values.flatten())  
       df_dis['station'] = station
       df_dis['max_dt_3days']= df_dis.dis.rolling(7, min_periods=3,center=True).max() 
       
       df_model = pd.merge(df_dis, df_dg_long, how='left', on='station').dropna()
       df_model = pd.merge(df_model, flood_events, how='left', on=['time', 'district'])
       df_model['thres_discharge'] = discharge_threshold
       df_model = df_model[df_model['time']> (flood_events.time.min() - dt.timedelta(days=7))]
       df_model = df_model[df_model['time']< (flood_events.time.max() + dt.timedelta(days=7))]
       df_model['flood'] = df_model['flood'].fillna(0)
       
       df_model['predicted'] = np.where((df_model['max_dt_3days'] >= df_model['thres_discharge']), 1, 0)
       perf= df_model.groupby(['district', 'station']).apply(lambda row: calc_performance_scores(row['flood'], row['predicted'])).reset_index()
       perf.loc[0,'threshold'] = 'Q' + str(int(100*value_check))
       performance_df = performance_df.append(perf)
       value_check = value_check + increment
       
   performance_df['objective_function'] = weight_far*performance_df['far'] + (1-weight_far)*(1-performance_df['pod'])
   return performance_df



#%% GLOFAS DATA EXTRACTION AND ANALYSIS

# Find the Glofas Stations in the Country 
#  extract discharge time series for each station from the Glofas Grid data 
# Compute the extreme annual discharge per station and the threshold quantiles

# Read the path to the Africa .csv file of all glofas virtual stations list of Africa, and select only the one for the country/ save the table as .csv
Gl_stations = pd.read_csv(my_local_path + '/africa/glofas/Glofaspoints_Africa_510.csv')  # do not change
Gl_stations = Gl_stations[Gl_stations['CountryNam']== country]
Gl_stations['station'] = Gl_stations['ID']
Gl_stations = Gl_stations[['ID','station', 'Stationnam', 'CountryNam','XCorrected','YCorrected']].set_index('ID').rename(columns={'Stationnam': 'location', 'CountryNam': 'Country','XCorrected': 'lon', 'YCorrected': 'lat'})
Gl_stations['Q50'] = float('NaN')
Gl_stations['Q80'] = float('NaN')
Gl_stations['Q90'] = float('NaN')
Gl_stations = Gl_stations[['Country', 'station', 'location', 'lon', 'lat', 'Q50', 'Q80', 'Q90']]

# Read the glofas grid Netcdf file of the country
# if not found, download
glofas_grid = path +'input/Glofas/%s_glofas_all.nc' %ct_code
if not os.path.exists(glofas_grid):
    print('GloFAS data not found, downloading it (this might take some time)')
    nc = get_glofas_data(country=country.lower(),
                         return_type='xarray',
                         credentials_file='settings.cfg')
    nc.to_netcdf(glofas_grid)
    print('download complete, continuing')
else:
    nc = xr.open_dataset(glofas_grid)

 
#%% INPUTS TO READ : (1) IMPACT DATABASE and (2) STATIONS_DISTRICT LINKING TABLE 

# (1) - Open the flood impact data .csv file and create a dataframe
#  !!!! Change the date format and the name of the Admin column in the script depending on the input of the country impact data .csv!! 
Date_format = '%d/%m/%Y'
Admin_column = 'Area'    # 'Area' for Uganda / 'County' for  Kenya

flood_events=pd.read_csv(path + 'input/%s_impact_data.csv' %ct_code, encoding='latin-1')  
flood_events['Date']= pd.to_datetime(flood_events['Date'], format=Date_format)    
flood_events= flood_events.query("Date >= '2000-01-01' ")  
flood_events = flood_events[['Date', Admin_column, 'flood']].drop_duplicates().rename(columns={Admin_column: 'district', 'Date': 'time'}).dropna()#.set_index('Date')  

# possibility to filter on flood event certainty/impact severity column for Uganda instead of previous line 
#flood_events = flood_events[['Date', Admin_column,'Certainty', 'Impact', 'flood']].drop_duplicates().rename(columns={Admin_column: 'district'}).dropna().set_index('Date')  
#flood_events= flood_events[flood_events['Certainty'] > 6]

flood_events['district']= flood_events['district'].str.lower()
floods_per_district = flood_events.groupby('district')['flood'].count()

# (2)- open the impacted_area and Glofas related stations per district files
df_dg=pd.read_csv(path + 'input/%s_affected_area_stations.csv' %ct_code, encoding='latin-1') 
df_dg['name']= df_dg['name'].str.lower() 
df_dg_long = df_dg[['name', 'Glofas_st', 'Glofas_st2', 'Glofas_st3', 'Glofas_st4']].melt(id_vars='name', var_name='glofas_n', value_name='station').drop('glofas_n', 1).dropna()
df_dg_long = df_dg_long.rename(columns = {'name': 'district'})
df_dg=df_dg.set_index('name')


#%%
# Create empty dictionary of all dstation discharge and a dataframe
di = {}
performance_scores = pd.DataFrame(columns=['district', 'station', 'nb_event', 'pod','far','pofd','csi','threshold','objective_function'])

for station in np.unique(Gl_stations['station']):

    Longitude = Gl_stations[Gl_stations['station']==station].lon
    Latitude = Gl_stations[Gl_stations['station']==station].lat
    nc_loc = nc.sel(lon=Longitude,lat=Latitude, method='nearest').rename({'dis24':'dis'})
    di[station] = nc_loc.dis
 
    extreme_dis = nc_loc.dis.resample(time='6M').max()
    tot_perf=tot_perf.append(threshold_optimize(station,0.5))
    
performance_scores = tot_perf[['district', 'station', 'pod','far','pofd','csi','threshold','objective_function']]  
performance_scores = pd.merge(floods_per_district, performance_scores, how='left', on=['district'])  
performance_scores = performance_scores.rename(columns={ 'flood': 'nb_event'})  

performance_scores.to_csv(path+ 'output/Performance_scores/%s_glofas_performance_score_optimized.csv' %ct_code, index=False)
 

 


    

