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


# Change per country
country = 'Uganda'  
ct_code = 'uga'

# Path name to the folder and local path
my_local_path = str(Path(os.getcwd()))
path = my_local_path + '/' + country + '/'

# Read the path to the relevant admin level shape to use for the study
Admin = path + 'input/Admin/uga_admbnda_adm1_UBOS_v2.shp'     #activate for Uganda
#Admin= path + 'input/Admin/KEN_adm1_mapshaper_corrected.shp' # activate for Kenya

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

# Create empty dictionary of all dstation discharge and a dataframe
di = {}
df_discharge = pd.DataFrame(columns=['station', 'time', 'dis','max_dt_3days'])

for station in np.unique(Gl_stations['station']):
    
    # 1- For the selected glofas station, extract the glofas discharge from the glofas Grid  coordinate and save in a dictionary
    
    Longitude = Gl_stations[Gl_stations['station']==station].lon
    Latitude = Gl_stations[Gl_stations['station']==station].lat
    nc_loc = nc.sel(lon=Longitude,lat=Latitude, method='nearest').rename({'dis24':'dis'})
    di[station] = nc_loc.dis
    #saving a .nc file per station if needed
    #nc_loc.to_netcdf(path + 'input/Glofas/stations_nc/%s_GlofasGrid_extraction_%s.nc' % ( ct_code, station))  
    
    # 2- Compute the yearly maximum discharge and associated quantiles per stations
    
    Extreme_dis = nc_loc.dis.groupby('time.year').max('time')
    Gl_stations.loc[station, 'Q50'] = Extreme_dis.quantile(0.5).values
    Gl_stations.loc[station, 'Q80'] = Extreme_dis.quantile(0.8).values
    Gl_stations.loc[station, 'Q90'] = Extreme_dis.quantile(0.9).values

    # 3- Extract the daily  discharge time-series station data (and save in a .csv per stationif needed)
    
    df_dis=pd.DataFrame(columns=['station', 'time', 'dis', 'max_dt_3days'])
    df_dis['time']= di[station]['time'].values
    df_dis['dis']= pd.Series(di[station].values.flatten()) 
    df_dis['station']=station
    # if needed / step for saving all station discharge time serie in .csv
    df_dis[['station', 'time', 'dis']].to_csv(path + 'input/Glofas/station_csv/GLOFAS_data_for_%s.csv' %station)  
    
    # 4- Create a dataframe with all daily discharge time-series station data, together with the daily lag of + and - 3 days
    
    df_dis['max_dt_3days']= df_dis.dis.rolling(7, min_periods=3,center=True).max()
    df_discharge= df_discharge.append(df_dis, ignore_index=True)
    
#save the final tables as .csv if needed     
Gl_stations.to_csv(path + 'input/Glofas/%s_glofas_station.csv' %ct_code)  # saving as .csv
df_discharge.to_csv(path + 'input/Glofas/station_csv/GLOFAS_fill_allstation.csv', index=False)
    
#%% INPUTS TO READ : (1) IMPACT DATABASE and (2) STATIONS_DISTRICT LINKING TABLE 

# (1) - Open the flood impact data .csv file and create a dataframe
#  !!!! Change the date format and the name of the Admin column in the script depending on the input of the country impact data .csv!! 
Date_format = '%d/%m/%Y'
Admin_column = 'Area'    # 'Area' for Uganda / 'County' for  Kenya

flood_events=pd.read_csv(path + 'input/%s_impact_data.csv' %ct_code, encoding='latin-1')  
flood_events['Date']= pd.to_datetime(flood_events['Date'], format=Date_format)    
flood_events= flood_events.query("Date >= '2000-01-01' ")  
flood_events = flood_events[['Date', Admin_column, 'flood']].drop_duplicates().rename(columns={Admin_column: 'district'}).dropna().set_index('Date')  

# possibility to filter on flood event certainty/impact severity column for Uganda instead of previous line 
#flood_events = flood_events[['Date', Admin_column,'Certainty', 'Impact', 'flood']].drop_duplicates().rename(columns={Admin_column: 'district'}).dropna().set_index('Date')  
#flood_events= flood_events[flood_events['Certainty'] > 6]

flood_events['district']= flood_events['district'].str.lower() 

# (2)- open the impacted_area and Glofas related stations per district files
df_dg=pd.read_csv(path + 'input/%s_affected_area_stations.csv' %ct_code, encoding='latin-1') 
df_dg['name']= df_dg['name'].str.lower() 
df_dg_long = df_dg[['name', 'Glofas_st', 'Glofas_st2', 'Glofas_st3', 'Glofas_st4']].melt(id_vars='name', var_name='glofas_n', value_name='station').drop('glofas_n', 1).dropna()
df_dg_long = df_dg_long.rename(columns = {'name': 'district'})
df_dg=df_dg.set_index('name')

#%% create a plot per district, only for the district having recorded impacts,  and for the related station per district
#Time-series are normalized !

Affected_admin=np.unique(flood_events['district'].values)  

for districts in Affected_admin: # for each district 
    print('############')
    print(districts)
    fe_district=flood_events[flood_events['district']==districts]
    df_event=fe_district['flood'] 
    df_dis=pd.DataFrame()
    st= df_dg.loc[districts, 'Glofas_st':'Glofas_st4']
    st= st.dropna()
    
    for j in range(0,len(st)) :  # for each related Glofas station associated to the district
        print(st[j])
        df_dis['time']= di[st[j]]['time'].values
        df_dis[st[j]]= pd.Series(di[st[j]].values.flatten()) 
        
        dff=normalize(df_dis.drop('time',axis=1))
        dff['time']=df_dis['time']
        df = dff.melt('time', var_name='Stations',  value_name='dis')
        
        fig = plt.figure(figsize=(16, 12),frameon=False, dpi=400)
        ax1 = fig.add_subplot(1, 1, 1)
        ax1.set_xlabel('Time (year)', fontsize=18)
        ax1.set_ylabel('Scale flow', fontsize=18)
        sns.lineplot(x="time", y="dis",  hue="Stations", data=df,ax=ax1)
        for index, row in df_event.iteritems():
            if row==1:
                ax1.axvline(x=index, color='y', linestyle='--')  
                    
        ax1.set_title( 'Glofas Test for Admin =%s'%districts,fontsize=20,bbox=dict(facecolor='red', alpha=0.5))
        fig.savefig(path+ 'output/Glofas_Analysis/flow_impact_%s.png' %districts)
        plt.clf()
    
    
#%% PLOTS to ZOOM TO SPECIFIC STATION AND TIMEFRAME
# manual QC of specific station and date : change date and station below

startYear, startMonth,startDay = (2008,5,1)
endYear, endMonth,endDay = (2014,11,15)

startDate = dt.datetime(year=startYear, month=startMonth, day=startDay)
endDate = dt.datetime(year=endYear, month=endMonth, day=endDay)

station = 'UG_GVS4'   #to change
districts = 'lira'

fe_district=flood_events[flood_events['district']==districts].reset_index()
dis_sel= di[station].sel(time=slice(startDate,endDate)) 

dis_sel.plot()
plt.hlines(Gl_stations.loc[station].Q50, startDate,endDate, linestyles= 'dashed')
plt.hlines(Gl_stations.loc[station].Q80, startDate,endDate, linestyles= 'dashed')
plt.hlines(Gl_stations.loc[station].Q90, startDate,endDate, linestyles= 'dashed')

for impacts_date in fe_district['Date']:
    if startDate <= impacts_date <= endDate :
        plt.axvline(x=impacts_date, color='y', linestyle='--')

plt.title('District : %s / Station : %s' % (districts, station))
  
#%%  Joining together tables and extracting discharge data to create a prediction model table (df_model)

impact_floods = flood_events.reset_index().rename(columns={'Date': 'time'})  
    
df_model = pd.merge(df_discharge, df_dg_long, how='left', on='station').dropna()
df_model = pd.merge(df_model, impact_floods , how='left', on=['time', 'district'])
df_model = pd.merge(df_model, Gl_stations[['station','Q50', 'Q80','Q90']] , how='left', on='station')#.set_index('time')
df_model = df_model[df_model['time']> (impact_floods.time.min() - dt.timedelta(days=7))]    #filtering the df to date after the first observed event
df_model = df_model[df_model['time']< (impact_floods.time.max() + dt.timedelta(days=7))]    #filtering the df to date before the last observed event

df_model['flood'] = df_model['flood'].fillna(0)

df_model['Q50_pred']=np.where((df_model['max_dt_3days'] >= df_model['Q50']), 1, 0)
df_model['Q80_pred']=np.where((df_model['max_dt_3days'] >= df_model['Q80']), 1, 0)
df_model['Q90_pred']=np.where((df_model['max_dt_3days'] >= df_model['Q90']), 1, 0)

df_model.to_csv(path + 'output/Glofas_Analysis/%s_glofas_matrix.csv' %ct_code, index=False)
#df_model.query('Q98_pred == 1')    #Tool to do a query in the df_model


#%% Calculating performance index of the prediction model and saving result in .csv
performance_scores=pd.DataFrame(columns=['district','station', 'pod','far','pofd','csi'])
quantiles = ['Q50_pred', 'Q80_pred', 'Q90_pred']

for quantile in quantiles:
    perf= df_model.groupby(['district', 'station']).apply(lambda row: calc_performance_scores(row['flood'], row[quantile])).reset_index()
    perf['quantile'] = quantile
    performance_scores=performance_scores.append(perf)
    
# adding the number of flood impact data per district
floods_per_district = impact_floods.groupby('district')['flood'].count()
performance_scores = pd.merge(floods_per_district, performance_scores, how='left', on=['district'])
performance_scores = performance_scores.rename(columns={ 'flood': 'nb_event'})
performance_scores = performance_scores[['district','station','nb_event','quantile', 'pod','far','pofd','csi']]

performance_scores.to_csv(path+ 'output/Performance_scores/%s_glofas_performance_score.csv' %ct_code, index=False)






    

