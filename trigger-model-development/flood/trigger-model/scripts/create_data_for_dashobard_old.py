# -*- coding: utf-8 -*-
"""
Created on Thu Jun 25 09:49:04 2020

@author: ATeklesadik
"""

import pandas as pd
import xarray as xr
import os
import numpy as np
import tqdm
 

#%%
def get_floods_and_regions():
    data_out = pd.read_csv('/Users/rodekruis/projects/ibf/data/flood_year_per_district.txt')
    data_out.set_index('Flood_year', inplace=True)

    return data_out, data_out.columns.values


def get_station_names_and_locations(datafiles_in, datadir_in):
    ids = []
    names = []
    lats = []
    lons = []
    files = []

    for f in datafiles_in:
        filename = f.split('_')
        ids.append(filename[4])
        names.append(filename[5])
        files.append(os.path.join(datadir_in, f))
        xdata = xr.open_dataset(os.path.join(datadir_in, f))
        lats.append(xdata.plat.values[0])
        lons.append(xdata.plon.values[0])
        xdata.close()

    return pd.DataFrame({'station_id': ids, 'station': names, 'latitude': lats, 'longitude': lons,
                         'filename': files})


def get_data_for_station(station_in, days_into_future):
    datafile = df_stations.query(f'station=="{station_in}"').filename.values[0]
    glofas_data = xr.open_dataset(datafile)

    glofas_data = glofas_data.sel(ensemble=slice(1, 10), step=days_into_future+1)
    glofas_data = glofas_data.squeeze(dim='size', drop=True)
    glofas_data = glofas_data.dis.median(dim='ensemble')
    #glofas_data = glofas_data.resample(time='1D').interpolate('linear')
  
    df_out = pd.DataFrame({'time':glofas_data.time.values,
                           'dis': glofas_data.values,
                       'max_dt_days':pd.Series(glofas_data_1.values.flatten()).rolling(7, min_periods=21,center=True).max().values},
                          index=glofas_data.time.values)
    df_out['station']=station
    return df_out


def get_predictions_for_station(station_in, thresholds_in, days_into_future,impact_floods):

    df_station = get_data_for_station(station_in, days_into_future)

    #df_out = df_station.groupby(df_station.index.year).max()
   # df_out.columns = ['maximum_discharge']
    #df_out['year'] = df_out.index.values.copy()
    
    
    df_model = pd.merge(df_station, impact_floods , how='left', on=['time', 'district'])
    #df_model = pd.merge(df_model, Gl_stations[['station','Q50', 'Q80','Q90','rl2']] , how='left', on='station') #.set_index('time')
    df_model = df_model[df_model['time']> (impact_floods.time.min() - dt.timedelta(days=30))]    #filtering the df to date after the first observed event
    df_model = df_model[df_model['time']< (impact_floods.time.max() + dt.timedelta(days=30))]    #filtering the df to date before the last observed event
    df_model['flood'] = df_model['flood'].fillna(0) 
    df_model.to_csv(path + 'output/Glofas_Analysis/%s_glofas_matrix3.csv' %ct_code, index=False)

    for thr in thresholds_in:
        df_out = pd.DataFrame({'time':df_station.time.values,
                       'dis': df_station.values,
                   'max_dt_days':pd.Series(df_station.values.flatten()).rolling(7, min_periods=21,center=True).max().values},
                      index=df_station.time.values)
        df_out['station']=station_in
        df_out['thr_{}'.format(thr)] = df_out.maximum_discharge.apply(lambda d: 1 if d > dis_threshold else 0)
        dis_threshold = df_out.quantile(thr/100).values[0]
        
        df_model['%s_pred']%thr=np.where((df_model['max_dt_days'] >= dis_threshold), 1, 0)
      

    return df_model


def get_predictions_for_all_stations(stations_in, thresholds_in, days_into_future):

    df_out = None

    for st in stations_in:
        df_station_preds = get_predictions_for_station(st, thresholds_in, days_into_future)
        df_station_preds['station'] = st
        if df_out is None:
            df_out = df_station_preds.copy()
        else:
            df_out = df_out.append(df_station_preds)

    return df_out


def create_output(df_stations_in, df_floods_in, regions_in, thresholds_in, df_all_preds_in):
    nr_stations = len(df_stations_in)
    nr_years = len(df_floods_in)
    nr_regions = len(regions_in)
    nr_thresholds = len(thresholds_in)

    len_df = nr_stations * nr_regions * nr_years * nr_thresholds
    temp_input = np.zeros(len_df)

    df_out = pd.DataFrame({'station': None, 'region': None, 'year': temp_input, 'threshold': 0, 'pred': 0, 'truth': 0})

    idx = 0
    for st in tqdm.tqdm(df_stations_in.station.values):
        for yr in df_floods_in.index.values:
            preds = df_all_preds_in.query('station=="{}" & year=="{}"'.format(st, yr))
            for thr in thresholds_in:
                for reg in regions_in:
                    df_out.at[idx, 'station'] = st
                    df_out.at[idx, 'region'] = reg
                    df_out.at[idx, 'year'] = yr
                    df_out.at[idx, 'threshold'] = thr
                    df_out.at[idx, 'pred'] = preds['thr_{}'.format(thr)].values[0]
                    df_out.at[idx, 'truth'] = df_floods_in.loc[yr, reg]
                    idx += 1

    return df_out


if __name__ == '__main__':
    # glofass data
    datadir = '/Users/rodekruis/projects/ibf/data/Glofas_new_datasets'
    thresholds = [80, 90, 95]
    forward_looking_days = 3

    datafiles = [f for f in os.listdir(datadir) if os.path.isfile(os.path.join(datadir, f))]

    df_stations = get_station_names_and_locations(datafiles, datadir)
    df_floods, regions = get_floods_and_regions()
    df_all_preds = get_predictions_for_all_stations(df_stations.station.values, thresholds, forward_looking_days)
    output = create_output(df_stations, df_floods, regions, thresholds, df_all_preds)
    output.to_csv('input_for_dashboard.csv')
