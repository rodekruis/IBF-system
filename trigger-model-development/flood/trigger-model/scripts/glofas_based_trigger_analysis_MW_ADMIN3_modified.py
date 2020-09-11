# -*- coding: utf-8 -*-
"""
Created on Sun Oct 20 20:24:03 2019

@author: ATeklesadik, ABucherie, PPhung
"""
# import regionmask
from pathlib import Path
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
import datetime as dt


def normalize(df):
    result = df.copy()
    for feature_name in df.columns:
        max_value = df[feature_name].max()
        min_value = df[feature_name].min()
        result[feature_name] = (df[feature_name] - min_value) / (max_value - min_value)
    return result

# read and filter duplicate events/ events within 3 wks
def get_impact_data(impactfile):
    '''
    Read impact database in a csv file and return the database into a DataFrame
    Within an admin3, the script also filter duplicate event (same day in the same admin3)
    and event that occured within 3 weeks after the previous one.
    
    Parameters
    ----------
    impactfile : directory and filename as string
        Example: 'C:/IBF/impactdata.csv'

    Returns
    -------
    df_event_filtered : pandas DataFrame

    '''
    df_event = pd.DataFrame(impactfile).dropna(axis = 'columns', how = 'all')
    df_event['date_event'] = pd.to_datetime(df_event['date_event'])
    df_event['date_event'] = df_event['date_event'].dt.date
    df_event = df_event.dropna(subset=['adm2_pcode', 'adm3_pcode'])
    # df_event['adm3_name'] = df_event[['adm3_name']].apply(lambda x: x.str.strip())
    df_event.drop_duplicates(subset=['adm3_pcode', 'date_event'], keep='first', inplace=True)
    df_event['flood'] = 1   # set observed events: 1, no event: 0
    df_event_filtered = pd.DataFrame()
    
    # Filter event that occurs within 3 weeks after a previous one
    for taa in np.unique(df_event['adm3_pcode'].astype(str)):
        df_event1 = df_event[df_event['adm3_pcode']==taa].sort_values(by='date_event', ascending=True).reset_index()
        for i in df_event1.index:
            if i+1 > df_event1.index.max():
                break
            else:
                if df_event1.loc[i,'date_event'] + dt.timedelta(weeks = 3) < df_event1.loc[i+1,'date_event']:
                    df_event1.drop([i+1], axis=0)
                else:
                    continue
        df_event_filtered = df_event_filtered.append(df_event1)
    
    return df_event_filtered

# compute confusion matrix and performance index functions

def calc_performance_scores(obs, pred):
    """
    compute confusion matrix (hits, false_al, misses, correct negatives) and performance indexes (FAR, POD, POFD, CSI)):
    Methodology adapted taking into account the consecutive day above thresholds as a unique flood period
    hits:              nb of peak period above thresholds that have at least one observation day within the period
    false alarm :      number of peak above threshold(consecutive day above discharge threshold as an event), minus the number of hits
    misses :           number of observed flood events no in a discharge peak period o above threshold
    correct negative : forcing the correct negative number to be the same than the number of observed flood events (misses + hits)
    """
    # print(obs, pred)
    df = pd.DataFrame({'cons_class': pred.diff().ne(0).cumsum(), 'hits': (obs == 1) & (pred == 1)})
    hits = df.hits[df.hits].count()
    false_al = (pred.loc[pred.shift() != pred].sum()) - hits
    misses = sum((obs == 1) & (pred == 0))
    corr_neg = misses + hits

    output = {}
    output['pod'] = hits / (hits + misses)
    output['far'] = false_al / (hits + false_al)
    output['pofd'] = false_al / (false_al + corr_neg)
    output['csi'] = hits / (hits + false_al + misses)

    output = pd.Series(output)
    return output
        
################### READ GLOFAS AND SHAPEFILES
mypath = str(Path(os.getcwd()).parent) #'C:/Users/pphung/Desktop/Malawi_Glofas'

adm_shp = gpd.read_file(mypath + '/shapes/malawi/mwi_adm_nso_20181016_shp/mwi_admbnda_adm3_nso_20181016.shp')
nc = xr.open_dataset(mypath + '/raw_data/malawi/glofas/data_MW_20002019.nc')
glofas_st_shape = gpd.read_file(mypath + '/shapes/malawi/glofas_stations/glofas_MW_st.shp')

# create station list
# station_list = pd.DataFrame()
glofas_st = gpd.sjoin(glofas_st_shape, adm_shp, how='inner', op='intersects')\
                .filter(['ID','geometry','ADM3_EN','ADM3_PCODE'])\
                .rename(columns={'ID':'Stations', 'ADM3_EN': 'TAA', 'ADM3_PCODE': 'TAA_PCODE'})

################### READ IMPACT DATA
flood_events = pd.read_csv(mypath + '/raw_data/malawi/malawi_impactdata_flood.csv', encoding='latin-1')  # load impact data
df_event = get_impact_data(flood_events)

df_total = pd.DataFrame()
date_window = 14
    
################### set up dataframe station-discharge 
for pcode in np.unique(df_event['adm3_pcode'].astype(str)):
    df_event1 = df_event[df_event['adm3_pcode']==pcode]
    # df_event1.index = df_event1['date_event']
    df_flow = pd.DataFrame()
    
    ## extract discharge of each station in the taa
    for ele in glofas_st[glofas_st['TAA_PCODE']==pcode]['Stations']:
        try:
            st_lon = glofas_st[glofas_st['Stations']==ele]['geometry'].centroid.x
            st_lat = glofas_st[glofas_st['Stations']==ele]['geometry'].centroid.y
            flow = nc.sel(lon=st_lon, lat=st_lat, method='nearest')
            df_flow[ele]=pd.Series(flow['dis24'].values.flatten())
            df_flow['Time'] = flow['time'].values
            df_flow['Time'] = df_flow['Time'].dt.date
            df_flow = df_flow.melt('Time', var_name='Stations', value_name='Dis')
            df_flow['Max_2wks'] = df_flow['Dis'].rolling(date_window, min_periods=3, center=True).max()
            # df_flow['TAA'] = pcode
            df_total = df_total.append(df_flow)
        except:
            continue
     
#### calculate return period of the station
# Q50 correspond to a return period of (1/0.02) = 2 years    
# Q80 correspond to a return period of (1/0.05) = 5 years  
# Q90 correspond to a return period of (1/0.1) = 10 years
flow_Q50 = df_total[['Stations','Dis']].groupby('Stations').quantile(0.5)
flow_Q80 = df_total[['Stations','Dis']].groupby('Stations').quantile(0.8)
flow_Q90 = df_total[['Stations','Dis']].groupby('Stations').quantile(0.9)
df_total['Q50'] = df_total['Stations'].map(flow_Q50['Dis'])
df_total['Q80'] = df_total['Stations'].map(flow_Q80['Dis'])
df_total['Q90'] = df_total['Stations'].map(flow_Q90['Dis'])

df_total = df_total.merge(glofas_st[['Stations', 'TAA', 'TAA_PCODE']], \
                          on='Stations', how='left')
df_total = df_total.merge(df_event[['date_event', 'adm3_name', 'adm3_pcode', 'flood']], \
              left_on=['Time', 'TAA_PCODE'], \
              right_on=['date_event', 'adm3_pcode'], how='left')\
            .drop(columns=['date_event', 'adm3_name', 'adm3_pcode'])
    
df_total['flood'] = df_total['flood'].fillna(0)
  
### check if discharge crossed the thresholds, if yes count as 1, else 0  
df_total['Q50_pred']=np.where((df_total['Max_2wks'] >= df_total['Q50']), 1, 0)
df_total['Q80_pred']=np.where((df_total['Max_2wks'] >= df_total['Q80']), 1, 0)
df_total['Q90_pred']=np.where((df_total['Max_2wks'] >= df_total['Q90']), 1, 0)


###### Plot per taa discharge and events (per station)
for taa in np.unique(df_total['TAA_PCODE']):
    df_event1 = df_event[df_event['adm3_pcode']==taa]
    # df_event1.index = df_event1['date_event']
    df_flow = df_total[df_total['TAA_PCODE']==taa]
    taaname = df_total[df_total['TAA_PCODE']==taa]['TAA'].iloc[0]
    ## plot discharge and flood events
    fig = plt.figure(figsize=(16, 10))
    ax1 = fig.add_subplot(1, 1, 1)
    sns.lineplot(x="Time", y="Dis", hue="Stations", data=df_flow, ax=ax1)
    # sns.lineplot(x="Time", y="Max_2wks", hue="Stations", data=df_total, ax=ax1)
    # event_date = df_event1['date_event']
    for index in df_event1['date_event']:#.iteritems():
        ax1.axvline(x=index, color='y', linestyle='--')
    plt.axhline(y=df_flow.Q50.iloc[0], color='r', linestyle=':')
    plt.axhline(y=df_flow.Q80.iloc[0], color='r', linestyle=':')
    plt.axhline(y=df_flow.Q90.iloc[0], color='r', linestyle=':')
    
    ax1.set_xlabel('Time (year)', fontsize=16)
    ax1.set_ylabel('Flow (m3/s)', fontsize=16)
    ax1.set_title('Glofas Test for %s' %taaname, fontsize=20, bbox=dict(facecolor='red', alpha=0.5))
    fig.savefig(mypath + '/output/malawi/glofas_analysis/flow_impact_%s.png' %taaname)


############# CALCULATE PERFORMANCE
performance_scores = pd.DataFrame()#columns=['taa','station', 'pod','far','pofd','csi'])
quantiles = ['Q50_pred', 'Q80_pred', 'Q90_pred']

for quantile in quantiles:
    perf = df_total.groupby(['TAA_PCODE', 'Stations']).apply(lambda row: calc_performance_scores(row['flood'], row[quantile])).reset_index()
    perf['quantile'] = quantile
    performance_scores = performance_scores.append(perf)
    
##### export results into csv file
floods_per_taa = df_event.groupby('adm3_pcode')['flood'].count()  ### count number of events per taa
performance_scores = pd.merge(floods_per_taa, performance_scores, how='left', left_on='adm3_pcode', right_on='TAA_PCODE')
performance_scores = performance_scores.rename(columns={ 'flood': 'nb_event'}).dropna(0)
performance_scores = performance_scores[['TAA_PCODE','Stations','nb_event','quantile', 'pod','far','pofd','csi']]

performance_scores.to_csv(mypath + '/output/malawi/glofas_analysis/mwi_glofas_performance_score.csv', index=False)