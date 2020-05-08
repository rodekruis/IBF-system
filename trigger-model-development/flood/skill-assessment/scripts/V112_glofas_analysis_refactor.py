# -*- coding: utf-8 -*-
"""
Created on Sun Oct 20 20:24:03 2019

@authors: ABucherie, JMargutti
"""
# this script objective is to extract and analyse Glofas historical data for specific stations, against flood impact events at district level
# and to compute the prediction performance of a model using only Glofas discharge thresholds.

# import necessary modules
import sys
sys.path.append("scripts")
import xarray as xr
import pandas as pd
import numpy as np
import os
from pandas.plotting import register_matplotlib_converters
register_matplotlib_converters()
import datetime as dt   # Python standard library datetime  module
from database_utils import get_glofas_data # utility functions to access database
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier


def normalize(df):
    """
    normalize dataframe
    """
    result = df.copy()
    for feature_name in df.columns:
        max_value = df[feature_name].max()
        min_value = df[feature_name].min()
        result[feature_name] = (df[feature_name] - min_value) / (max_value - min_value)
    return result


def prepare_glofas_stations_data(country='Uganda', path='.'):
    """
    Read the path to the Africa .csv file of all glofas virtual stations list of Africa
     and select only the one for the country/ save the table as .csv
    """
    Gl_stations = pd.read_csv(path + '/africa/glofas/Glofaspoints_Africa_510.csv')  # do not change
    Gl_stations = Gl_stations[Gl_stations['CountryNam'] == country]
    Gl_stations['station'] = Gl_stations['ID']
    Gl_stations = Gl_stations[['ID', 'station', 'Stationnam', 'CountryNam', 'XCorrected', 'YCorrected']].set_index(
        'ID').rename(
        columns={'Stationnam': 'location', 'CountryNam': 'Country', 'XCorrected': 'lon', 'YCorrected': 'lat'})
    Gl_stations = Gl_stations[['Country', 'station', 'location', 'lon', 'lat']]
    return Gl_stations


def prepare_dataframe_stations_discharge(GloFAS_stations, GloFAS_data, path):
    """
        Create dataframe of glofas stations, daily discharge and max-over-3-days discharge
    """
    df_discharge = pd.DataFrame(columns=['station', 'time', 'dis', 'max_dt_3days'])
    # loop over stations
    for station in np.unique(GloFAS_stations['station']):
        # For the selected glofas station, extract the glofas discharge from the glofas Grid  coordinate and save in a dictionary
        Longitude = GloFAS_stations[GloFAS_stations['station'] == station].lon
        Latitude = GloFAS_stations[GloFAS_stations['station'] == station].lat
        nc_loc = GloFAS_data.sel(lon=Longitude, lat=Latitude, method='nearest').rename({'dis24': 'dis'})
        station_discharge = nc_loc.dis

        # Extract the daily discharge time-series station data (and save in a .csv per station if needed)
        df_dis = pd.DataFrame(columns=['station', 'time', 'dis', 'max_dt_3days'])
        df_dis['time'] = station_discharge['time'].values
        df_dis['dis'] = pd.Series(station_discharge.values.flatten())
        df_dis['station'] = station
        # if needed / step for saving all station discharge time serie in .csv
        df_dis[['station', 'time', 'dis']].to_csv(path + 'input/Glofas/station_csv/GLOFAS_data_for_%s.csv' % station)

        # 4- Create a dataframe with all daily discharge time-series station data, together with the daily lag of + and - 3 days
        df_dis['max_dt_3days'] = df_dis.dis.rolling(7, min_periods=3, center=True).max()
        df_discharge = df_discharge.append(df_dis, ignore_index=True)

    return df_discharge


def get_impact_data(date_format, admin_column, ct_code, path):
    flood_events = pd.read_csv(path + 'input/%s_impact_data.csv' % ct_code, encoding='latin-1')
    flood_events['Date'] = pd.to_datetime(flood_events['Date'], format=date_format)
    flood_events = flood_events.query("Date >= '2000-01-01' ")
    flood_events = flood_events[['Date', admin_column, 'flood']].drop_duplicates()\
        .rename(columns={admin_column: 'district'}).dropna().set_index('Date')
    # possibility to filter on flood event certainty/impact severity column for Uganda instead of previous line
    #flood_events = flood_events[['Date', Admin_column,'Certainty', 'Impact', 'flood']].\
    # drop_duplicates().rename(columns={Admin_column: 'district'}).dropna().set_index('Date')
    #flood_events= flood_events[flood_events['Certainty'] > 6]
    flood_events['district'] = flood_events['district'].str.lower()
    flood_events = flood_events.reset_index().rename(columns={'Date': 'time'})
    return flood_events


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


def train_test_model(df_model,
                     predictor='max_dt_3days',
                     model_type='quantile_discharge',
                     loss='far'):

    performance_scores = pd.DataFrame()

    # loop over districts
    for district in df_model.district.unique():
        df_district = df_model[df_model['district'] == district]
        if df_district.flood.nunique() < 2:
            continue

        if model_type == 'quantile_discharge':
            performance_model = pd.DataFrame(columns=['parameters', 'pod', 'far', 'pofd', 'csi'])

            # loop over stations and test all possible quantiles
            for station in df_district['station'].unique():
                df_station = df_district[df_district['station'] == station]
                extreme_dis = df_station.set_index('time')[predictor].groupby(pd.Grouper(freq='6M')).max()

                for q in range(50, 100):
                    threshold = extreme_dis.quantile(q/100.)
                    df_station['predictions'] = np.where((df_station[predictor] >= threshold), 1, 0)

                    perf = df_station.groupby(['district', 'station']).\
                        apply(lambda row: calc_performance_scores(row['flood'], row['predictions']))
                    perf['parameters'] = str((station, str(q)))
                    perf['district'] = district
                    performance_model = performance_model.append(perf, ignore_index=True)

            # find the couple (station, quantile) that minimizes loss function
            best_performance = performance_model.iloc[performance_model[loss].idxmin]
            # save performance
            performance_scores = performance_scores.append(best_performance, ignore_index=True)

        elif model_type == 'bdt_discharge':
            # prepare training data
            X, y = [], []
            df_ordered = df_district.groupby(['station', 'time'])[predictor].max()
            for time in df_district.time.unique():
                X.append([df_ordered.loc[(station, time)] for station in df_district.station.unique()])
                y.append(df_district[df_district['time'] == time]['flood'].values[0])
            # train and predict
            model = GradientBoostingClassifier(max_features='auto', loss='exponential')
            sample_weight = [len(y) / y.count(i) for i in y]
            model.fit(X, y, sample_weight)
            predictions = model.predict(X)
            # save performance
            best_performance = calc_performance_scores(pd.Series(y), pd.Series(predictions))
            best_performance['parameters'] = str(model.get_params())
            best_performance['district'] = district
            performance_scores = performance_scores.append(best_performance, ignore_index=True)

    return performance_scores


def main(country='Uganda',
         ct_code='uga',
         model='quantile',
         loss='far'):

    # Path name to the folder and local path
    my_local_path = str(Path(os.getcwd()))
    path = my_local_path + '/' + country + '/'

    # Set path to admin level shape to use for the study
    Admin = path + 'input/Admin/uga_admbnda_adm1_UBOS_v2.shp'     #activate for Uganda
    #Admin = path + 'input/Admin/KEN_adm1_mapshaper_corrected.shp' # activate for Kenya

    #%% GLOFAS DATA EXTRACTION AND ANALYSIS

    # Find the Glofas Stations in the Country
    #  extract discharge time series for each station from the Glofas Grid data
    # Compute the extreme annual discharge per station and the threshold quantiles

    # get glofas stations (dataframe)
    Gl_stations = prepare_glofas_stations_data(country, my_local_path)

    # get glofas data (grid Netcdf file)
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

    # Create dataframe of glofas stations, daily discharge and max-over-3-days discharge
    df_discharge = prepare_dataframe_stations_discharge(Gl_stations, nc, path)

    # get impact data
    # NB Change date format and the name of the admin column depending on the input of the country impact data .csv!!
    date_format = '%d/%m/%Y'
    if country.lower() == 'uganda':
        admin_column = 'Area'
    elif country.lower() == 'kenya':
        admin_column = 'County'
    impact_floods = get_impact_data(date_format, admin_column, ct_code, path)

    # open the impacted_area and Glofas related stations per district files
    df_dg = pd.read_csv(path + 'input/%s_affected_area_stations.csv' % ct_code, encoding='latin-1')
    df_dg['name'] = df_dg['name'].str.lower()
    df_dg_long = df_dg[['name', 'Glofas_st', 'Glofas_st2', 'Glofas_st3', 'Glofas_st4']]\
        .melt(id_vars='name', var_name='glofas_n', value_name='station').drop('glofas_n', 1).dropna()
    df_dg_long = df_dg_long.rename(columns={'name': 'district'})

    # join together tables and extract discharge data to create a prediction model table (df_model)
    df_model = pd.merge(df_discharge, df_dg_long, how='left', on='station').dropna()
    df_model = pd.merge(df_model, impact_floods, how='left', on=['time', 'district'])
    df_model = pd.merge(df_model, Gl_stations[['station']], how='left', on='station')
    df_model = df_model[df_model['time'] > (impact_floods.time.min() - dt.timedelta(days=7))]    #filtering the df to date after the first observed event
    df_model = df_model[df_model['time'] < (impact_floods.time.max() + dt.timedelta(days=7))]    #filtering the df to date before the last observed event
    df_model['flood'] = df_model['flood'].fillna(0)
    print(df_model.head())

    # train & test model, compute performance
    performance = train_test_model(df_model,
                                   predictor='max_dt_3days',
                                   model_type='bdt_discharge',
                                   loss=loss)

    # add to performance the number of floods per district
    floods_per_district = impact_floods.groupby('district')['flood'].count()
    performance = pd.merge(floods_per_district, performance, how='left', on=['district'])
    performance = performance.rename(columns={'flood': 'nb_event'})
    performance.to_csv(path + 'output/Performance_scores/{}_glofas_{}_performance_score.csv'.format(ct_code, model), index=False)

    print('median performance:')
    print(performance[['pod', 'far', 'pofd', 'csi']].median())


if __name__ == "__main__":
    main()






    

