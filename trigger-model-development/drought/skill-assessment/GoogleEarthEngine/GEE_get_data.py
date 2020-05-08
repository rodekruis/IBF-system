import ee
from GEE_utils import extract_data_EE, fcdict_to_df
import pandas as pd

# initialize GEE
ee.Initialize()

# define dictionary of countries, with location of admin level shapefiles on GEE

country_dict = {
    "KE": 'users/jacopomargutti/ken_admbnda_adm1',
    "UG": 'users/jacopomargutti/uga_admbnda_adm1'
}

output_folder = 'data/'

# loop over countries
for country_abb, admin_file in country_dict.items():

    # get country admin level shapefile
    country = ee.FeatureCollection(admin_file)
    # year range
    year_start, year_end = 2000, 2019

    # NDVI
    name = 'ndvi'

    # Collect Features:
    fc_ndvi_mean = extract_data_EE(im_col="MODIS/006/MOD13A2",
                                   fe_col=country,
                                   min_year=year_start,
                                   max_year=year_end,
                                   min_month=1,
                                   max_month=12,
                                   reducer_time=ee.Reducer.mean(),
                                   reducer_space=ee.Reducer.mean())
    # Turn feature collection dict to a single dataframe
    df_ndvi_mean = fcdict_to_df(year_start, fc_ndvi_mean)
    df_ndvi_mean = df_ndvi_mean.rename(columns={'mean': 'ndvi'})
    df_ndvi_mean.to_csv(output_folder + country_abb + "_"+name+"_adm1.csv", sep=',', index=False)

    # Global Monthly Precipitation Estimates
    name = 'precipitation_estimate'
    print('start', name, '####################################')

    # Collect Features:
    fc_p_sum = extract_data_EE(im_col="TRMM/3B43V7",
                               fe_col=country,
                               min_year=year_start,
                               max_year=year_end,
                               min_month=1,
                               max_month=12,
                               reducer_time=ee.Reducer.sum(),
                               reducer_space=ee.Reducer.mean())
    # Turn feature collection dict to a single dataframe
    df_p_sum = fcdict_to_df(year_start, fc_p_sum)
    df_p_sum = df_p_sum.rename(columns={'mean': 'precipitation_estimate'})
    df_p_sum.to_csv(output_folder + country_abb + "_"+name+"_adm1.csv", sep=',', index=False)

    # Global Precipitation Measurements
    name = 'precipitation_measurements'
    print('start', name, '####################################')

    df_p_tot = pd.DataFrame()
    for GPM_which in ['JAXA/GPM_L3/GSMaP/v6/reanalysis', 'JAXA/GPM_L3/GSMaP/v6/operational']:
        # Collect Features:
        fc_p_sum = extract_data_EE(im_col=GPM_which,
                                   fe_col=country,
                                   min_year=year_start,
                                   max_year=year_end,
                                   min_month=1,
                                   max_month=12,
                                   reducer_time=ee.Reducer.sum(),
                                   reducer_space=ee.Reducer.mean())

        # Turn feature collection dict to a single dataframe
        df_p_sum = fcdict_to_df(year_start, fc_p_sum)
        df_p_sum = df_p_sum.rename(columns={'mean': 'precipitation_measure'})
        df_p_tot = df_p_tot.append(df_p_sum, ignore_index=True)
    df_p_tot.to_csv(output_folder + country_abb + "_"+name+"_adm1.csv", sep=',', index=False)

    # Land Surface Temperature
    name = 'land_surface_temperature'
    print('start', name, '####################################')

    # Collect Features:
    fc_lst_mean = extract_data_EE(im_col="MODIS/006/MOD11A1",
                                  fe_col=country,
                                  min_year=year_start,
                                  max_year=year_end,
                                  min_month=1,
                                  max_month=12,
                                  reducer_time=ee.Reducer.mean(),
                                  reducer_space=ee.Reducer.mean())

    # Turn feature collection dict to a single dataframe
    df_lst_mean = fcdict_to_df(year_start, fc_lst_mean)
    df_lst_mean = df_lst_mean.rename(columns={'mean': 'lst'})
    df_lst_mean.to_csv(output_folder + country_abb + "_"+name+"_adm1.csv", sep=',', index=False)

    # Soil Moisture
    name = 'soil_moisture'
    print('start', name, '####################################')

    # Collect Features:
    fc_soilmois_mean = extract_data_EE(im_col="NASA/FLDAS/NOAH01/C/GL/M/V001",
                                       fe_col=country,
                                       min_year=year_start,
                                       max_year=year_end,
                                       min_month=1,
                                       max_month=12,
                                       reducer_time=ee.Reducer.mean(),
                                       reducer_space=ee.Reducer.mean())

    # Turn feature collection dict to a single dataframe
    df_soilmois_mean = fcdict_to_df(year_start, fc_soilmois_mean)
    df_soilmois_mean = df_soilmois_mean.rename(columns={'mean': 'soilmois_mean'})
    # save NDVI dataframe to .CSV
    df_soilmois_mean.to_csv(output_folder + country_abb + "_"+name+"_adm1.csv", sep=',', index=False)
