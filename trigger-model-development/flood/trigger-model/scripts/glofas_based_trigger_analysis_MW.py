# -*- coding: utf-8 -*-
"""
Created on Sun Oct 20 20:24:03 2019

@author: ATeklesadik, ABucherie, PPhung
"""
# import regionmask
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
from sklearn.metrics import confusion_matrix
# import datetime as dt


def normalize(df):
    result = df.copy()
    for feature_name in df.columns:
        max_value = df[feature_name].max()
        min_value = df[feature_name].min()
        result[feature_name] = (df[feature_name] - min_value) / (max_value - min_value)
    return result

# compute confusion matrix and performance index functions

def calc_pod(obs, pred):
    corr_neg, false_al, misses, hits = confusion_matrix(obs, pred).ravel()    
    POD = hits / (hits + misses)
    return POD

def calc_far(obs, pred):
    corr_neg, false_al, misses, hits = confusion_matrix(obs, pred).ravel()
    FAR = false_al / (hits + false_al)
    return FAR
    
def calc_pofd(obs, pred):
    corr_neg, false_al, misses, hits = confusion_matrix(obs, pred).ravel()    
    POFD = false_al / (false_al + corr_neg)
    return POFD

def calc_csi(obs, pred):
    corr_neg, false_al, misses, hits = confusion_matrix(obs, pred).ravel()    
    CSI = hits / (hits + false_al + misses)
    return CSI

def calc_performance_scores(obs, pred):
    output = {}
    output['pod'] = calc_pod(obs, pred)
    output['far'] = calc_far(obs, pred)
    output['pofd'] = calc_pofd(obs, pred)
    output['csi'] = calc_csi(obs, pred)
    
    output = pd.Series(output)
    return output
        
################### READ GLOFAS AND SHAPEFILES
mypath = 'C:/Users/pphung/Desktop/Malawi_Glofas' #os.path

nc = xr.open_dataset(mypath + '/glofas/data_MW_20002019.nc')
adm_shp = gpd.read_file(mypath + '/shape/mwi_adm_nso_20181016_shp/mwi_admbnda_adm2_nso_20181016.shp')
glofas_st_shape = gpd.read_file(mypath + '/shape/glofas_MW_st.shp')

# create station list
# station_list = pd.DataFrame()
glofas_st = gpd.sjoin(glofas_st_shape, adm_shp, how='inner', op='intersects')\
                .filter(['ID','geometry','ADM2_EN','ADM2_PCODE'])\
                .rename(columns={'ID':'Stations','ADM2_EN': 'District', 'ADM2_PCODE': 'Dist_PCODE'})

################### READ IMPACT DATA
flood_events = pd.read_csv(mypath + '/Malawi_Data_new_flood.csv', encoding='latin-1')  # load impact data

df_event = pd.DataFrame(flood_events).dropna(axis = 'columns', how = 'all')
df_event['date_event'] = pd.to_datetime(df_event['date_event'])
df_event['date_event'] = df_event['date_event'].dt.date
df_event = df_event.dropna(subset=['adm2_name'])
df_event['flood'] = 1

affected_adm2 = np.unique(df_event['adm2_name'].astype(str))

df_total = pd.DataFrame()
date_window = 3
    
################### calculate and create plot per district 
for district in affected_adm2:
    df_event1 = df_event[df_event['adm2_name']==district]
    # df_event1.index = df_event1['date_event']
    df_flow = pd.DataFrame()
    
    ## extract discharge of each station in the district
    for ele in glofas_st[glofas_st['District']==district]['Stations']:
        # try:
        st_lon = glofas_st[glofas_st['Stations']==ele]['geometry'].centroid.x
        st_lat = glofas_st[glofas_st['Stations']==ele]['geometry'].centroid.y
        flow = nc.sel(lon=st_lon, lat=st_lat, method='nearest')
        df_flow[ele]=pd.Series(flow['dis24'].values.flatten())
        df_flow['Time'] = flow['time'].values
        df_flow['Time'] = df_flow['Time'].dt.date
    df_flow = df_flow.melt('Time', var_name='Stations', value_name='Dis')
        
    df_flow['District'] = district
     
    #### calculate return period of the station
    # Q50 correspond to a return period of (1/0.02) = 2 years    
    # Q80 correspond to a return period of (1/0.05) = 5 years  
    # Q90 correspond to a return period of (1/0.1) = 10 years
    flow_Q50 = df_flow[['Stations','Dis']].groupby('Stations').quantile(0.5)
    flow_Q80 = df_flow[['Stations','Dis']].groupby('Stations').quantile(0.80)
    flow_Q90 = df_flow[['Stations','Dis']].groupby('Stations').quantile(0.90)
    df_flow['Q50'] = df_flow['Stations'].map(flow_Q50['Dis'])
    df_flow['Q80'] = df_flow['Stations'].map(flow_Q80['Dis'])
    df_flow['Q90'] = df_flow['Stations'].map(flow_Q90['Dis'])
        
    df_flow = df_flow.merge(df_event[['date_event', 'adm2_name', 'flood']], \
                  left_on=['Time', 'District'], \
                  right_on=['date_event', 'adm2_name'], how='left')\
                .drop(columns=['date_event', 'adm2_name'])
    
    df_flow['flood'] = df_flow['flood'].fillna(0)
    df_flow['Q50_pred'] = 0
    df_flow['Q80_pred'] = 0
    df_flow['Q90_pred'] = 0
        
    for i in range(len(df_flow)+1):
        try:
            # if df_flow.loc[i, 'flood'] == 1:
            flow_in_window = df_flow.loc[i-date_window:i+date_window, 'Dis']                        
            if any(j >= df_flow.loc[i, 'Q50'] for j in flow_in_window):
                df_flow.loc[i,'Q50_pred'] = 1
            if any(j >= df_flow.loc[i, 'Q80'] for j in flow_in_window):
                df_flow.loc[i,'Q80_pred'] = 1
            if any(j >= df_flow.loc[i, 'Q90'] for j in flow_in_window):
                df_flow.loc[i,'Q90_pred'] = 1    
        except:
            continue
    
    df_total = df_total.append(df_flow)
    
    ## plot discharge and flood events
    fig = plt.figure(figsize=(16, 10))
    ax1 = fig.add_subplot(1, 1, 1)
    sns.lineplot(x="Time", y="Dis", hue="Stations", data=df_flow, ax=ax1)
    # event_date = df_event1['date_event']
    for index in df_event1['date_event']:#.iteritems():
        ax1.axvline(x=index, color='y', linestyle='--')
    plt.axhline(y=flow_Q50.Dis.min(), color='r', linestyle=':')
    plt.axhline(y=flow_Q80.Dis.min(), color='r', linestyle=':')
    plt.axhline(y=flow_Q90.Dis.min(), color='r', linestyle=':')
    
    ax1.set_xlabel('Time (year)', fontsize=16)
    ax1.set_ylabel('Flow (m3/s)', fontsize=16)
    ax1.set_title('Glofas Test for %s' %district, fontsize=20, bbox=dict(facecolor='red', alpha=0.5))
    fig.savefig(mypath + '/outputs/flow_impact_%s.png' %district)
            
#         # except:
#         #     continue

# # df_total = df_total.drop(columns = ['date_event','adm2_name'])

############# CALCULATE PERFORMANCE
performance_scores = pd.DataFrame()#columns=['district','station', 'pod','far','pofd','csi'])
quantiles = ['Q50_pred', 'Q80_pred', 'Q90_pred']

for quantile in quantiles:
    perf = df_total.groupby(['District', 'Stations']).apply(lambda row: calc_performance_scores(row['flood'], row[quantile])).reset_index()
    perf['quantile'] = quantile
    performance_scores = performance_scores.append(perf)
    
# adding the number of flood impact data per district
floods_per_district = df_event.groupby('adm2_name')['flood'].count()
performance_scores = pd.merge(floods_per_district, performance_scores, how='left', left_on='adm2_name', right_on='District')
performance_scores = performance_scores.rename(columns={ 'flood': 'nb_event'})
# performance_scores = performance_scores[['district','station','nb_event','quantile', 'pod','far','pofd','csi']]

performance_scores.to_csv(mypath + '/outputs/mwi_glofas_performance_score.csv', index=False)