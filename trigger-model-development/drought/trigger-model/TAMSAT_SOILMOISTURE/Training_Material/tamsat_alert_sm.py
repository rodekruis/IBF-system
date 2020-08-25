import numpy as np
import pandas as pd
import tamsat_alert.utils_sm as utils_sm
from tamsat_alert.tamsat_alert import ensemble_timeseries, strip_leap_days
from tamsat_alert.tamsat_alert_plots import risk_prob_plot

def tamsat_alert_sm(data,
                    fc_data,
                    met_ts_varname,
                    cast_date,
                    soil_texture_str,
                    output_dir,
                    poi_start_day, poi_start_month,
                    poi_end_day, poi_end_month,
                    fc_start_day, fc_start_month,
                    fc_end_day, fc_end_month,
                    lead_time_days,
                    tercile_weights=[1,1,1],
                    clim_start_year=None, clim_end_year=None,
                    poi_start_year=None, poi_end_year=None,
                    norm_not_ecdf=True,
                    run_start=None, run_end=None,
                    location_name=None,
                    shortwave_radiation_str='sw',
                    longwave_radiation_str='lw',
                    precipitation_rate_str='pr',
                    snow_str='snow',
                    temperature_str='temp',
                    pressure_str='P',
                    wind_u_comp_str='uwind',
                    wind_v_comp_str='vwind',
                    humidity_str='q',
                    temperature_range_str='Trange',
                    fc_temp_str='temp',
                    fc_precip_str='rfe',
                    spinup={
                        'num_spin_year': 2,
                        'spin_cyc': 5,
                        'data_period': 86400,
                        'model_t_step': 3600
                    },
                    initial_conditions={
                        'su_init': [0.749, 0.743, 0.754, 0.759],
                        'fa_init': 0.0,
                        'LAI': 0.0,
                        'er': 1.0,
                        'I_v': 0.5,
                        'dz': [0.1, 0.25, 0.65, 2.0],
                        'dr': 0.0,
                        'h': 0.0,
                    },
                    data_period=86400):
    '''
    Generates the data and plots for the soil moisture aspect of TAMSAT ALERT.

    :param data:            A pandas DataFrame containing the data to use for running the TAMSAT alert code
    :param fc_data:         A pandas DataFrame containing the data to use for providing meteorological forecast time series to inform the allocation of ensemble member weights
    :param met_ts_varname:  A string indicating whether the meteorological forecast is for temperature or for precipitation. Acceptable values are:
                            'precipitation','temperature'
    :param cast_date:       The date at which to start fore/hind-cast.
                            This should be a pandas Timestamp object
    :param soil_texture_str:A string representing the soil texture.  Acceptable values are:
                            'clay', 'silty clay', 'sandy clay', 'silty clay loam',
                            'clay loam','sandy clay loam', 'loam', 'silt loam',
                            'sandy loam', 'silt', 'loamy sand', 'sand'
    :param output_dir:      The path at which to output data and plots
    :param poi_start_day:   The day of the month of the start of the period of interest
    :param poi_start_month: The month of the year of the start of the period of interest
    :param poi_end_day:     The day of the month of the end of the period of interest
    :param poi_end_month:   The month of the year of the end of the period of interest
    :param fc_start_day:    The day of the month of the start of the meteorological forecast
    :param fc_start_month:  The month of the year of the start of the meteorological forecast
    :param fc_end_day:      The day of the month of the end of the meteorological forecast
    :param fc_end_month:    The month of the year of the end of the meteorological forecast
    :param lead_time_days:
    :param tercile_weights: An array or tuple containing the tercile weights [low, med, hi]
                            Optional - if not specified, uses equal weightings
    :param clim_start_year: The start year of the climatology
                            Optional - if not specified, uses the first year in the data
    :param clim_end_year:   The end year of the climatology
                            Optional - if not specified, uses the last year in the data
    :param poi_start_year:  The first year of interest
                            Optional - if not specified, uses the first year in the data
    :param poi_end_year:    The last year of interest
                            Optional - if not specified, uses the last year in the data
    :param norm_not_ecdf:   The probability distribution to use for percentile calculations
                            True is normal, False is ECDF
                            Optional, defaults to True
    :param cum_not_mean:    What operation to perform on the results
                            True is cumulative (i.e. numpy.sum())
                            False is mean (i.e. numpy.mean())
                            Optional, defaults to True
    :param run_start:       The start date for the runs.  All ensembles will be
                            constructed from data between this date and cast_date.
                            This should be a pandas Timestamp object.

                            Optional. If not present, it will be the 1st January
                            of the same year as the cast_date
    :param run_start:       The end date for the runs.  All ensembles will be
                            constructed from data between cast_date and this date,
                            but for every available year in the dataset.
                            This should be a pandas Timestamp object.

                            This is optional.  If not present, it will be the 31st December
                            of the year after the cast_date
    :param location_name:   The name of the location to appear on the plots
                            Optional - if not specified, tries to calculate from the data
    :param shortwave_radiation_str: The column name in the pandas dataframe.
                            Default is 'sw'
    :param longwave_radiation_str: The column name in the pandas dataframe.
                            Default is 'lw'
    :param precipitation_rate_str: The column name in the pandas dataframe.
                            Default is 'pr'
    :param snow_str: The column name in the pandas dataframe.
                            Default is 'snow'
    :param temperature_str: The column name in the pandas dataframe.
                            Default is 'temp'
    :param pressure_str: The column name in the pandas dataframe.
                            Default is 'P'
    :param wind_u_comp_str: The column name in the pandas dataframe.
                            Default is 'uwind'
    :param wind_v_comp_str: The column name in the pandas dataframe.
                            Default is 'vwind'
    :param humidity_str: The column name in the pandas dataframe.
                            Default is 'q'
    :param temperature_range_str: The column name in the pandas dataframe.
                            Default is 'Trange'
    :param spinup:          A dictionary containing parameters for the spinup of the model
                            Keys must include all of:
                                'num_spin_year' - how many years of data to use for
                                                spinup (default 2)
                                'spin_cyc' - how many times to run the spinup (default 5)
                                'data_period' - ??? (default 86400) ECB: Don't know why this is here. The function didn't work when I ran it.
                                'model_t_step' - ???(default 3600)
    :param initial_conditions: A dictionary containing parameters for ???
                            Keys must include all of:
                                'su_init' - ratio of soil moisture to saturation.
                                            This is a length 4 list ???
                                            (default [0.749, 0.743, 0.754, 0.759])
                                'fa_init' - wet fraction of the vegetation
                                            (default 0.0)
                                'LAI' - leaf area index
                                        (default 0.0)
                                'er' - fraction of the grid covered where rain fall
                                       (default 1.0)
                                'I_v' - soil infiltration enhancement factor
                                        (default 0.5)
                                'dz' - soil layer thickness
                                       This is a length 4 list ???
                                       (default [0.1, 0.25, 0.65, 2.0]) thickness
                                'dr' - rooting depth (m)
                                       (default 0.0)
                                'h' - plant height (m)
                                       (default 0.0)
    :param data_period: An integer specifying the number of seconds for each time step in the input data (default 86400)
    '''

    # GG Hacks to generate required but redundant variables
    if(norm_not_ecdf):
        stat='normal'
    else:
        stat='ecdf'
    datastartyear = data.index[0].year
    dataendyear = data.index[-1].year
    operation = np.sum
    # GG End

    #ECB changed tmp so that the met forecast data can come from a different source to the SM driving data.
    #ECB added in variable met_ts_varname, which indicates whether we are using the temperature or precipitation from the fc_data pandas dataframe as our meteorological forecast variable.
    if met_ts_varname == "precipitation":
        tmp = fc_data[fc_precip_str]
    if met_ts_varname == "temperature":
        tmp = fc_data[fc_temp_str]
    met_ts = strip_leap_days(tmp)

    forecast_sums = ensemble_timeseries(met_ts,
                                        fc_start_day,
                                        fc_start_month,
                                        fc_end_day,
                                        fc_end_month,
                                        clim_start_year,
                                        clim_end_year,
                                        operation)




    # reading driving data.
    #ECB note. Check that the units require this conversion.
    P = data[precipitation_rate_str] / 86400 # precipitation (Kg m-2 s-1)
    T = data[temperature_str]  # temperature (K)
    p = data[pressure_str]  # pressure (Pa)
    uwind = data[wind_u_comp_str]  # wind speed (m s-1)
    vwind = data[wind_v_comp_str]  # wind speed (m s-1)
    q1 = data[humidity_str]  # specific humidity (Kg Kg-1)
    dt = data[temperature_range_str]  # temperature range (K)
    # ---- wind calculation ------ #
    u = np.sqrt((uwind**2) + (vwind**2))

    # fixed value
    gl = 10**-2  # leaf (stomata) conductance



    #time indices. Note that we should use pandas for this.
    years = np.arange(datastartyear, dataendyear + 1)
    fy_ind = sorted(years).index(cast_date.year)
    climayears = np.arange(clim_start_year, clim_end_year+1)


    # The hydraulic parameters of the soil based on the sand, silt, clay
    # content of the soil.
    # b(-),psi_s(m), Ks(mm/s), theta_s(m3/m3), theta_c(m3/m3),
    # theta_w(m3/m3)
    b, psi_s, Ks, theta_s, theta_c, theta_w = utils_sm.pedoclass(soil_texture_str)

    tmp=cast_date-pd.Timestamp(cast_date.year,1,1)
    ind=tmp.days

    # interpolating daily data to hourly values
    if data_period == 86400:
        P, p, u, q1, T, dt = utils_sm.interp_data(P, p, u, q1, T, dt, data_period, spinup['model_t_step'])

    # ---------------------------------------------------------------#
    # calculate the soil moisture ratio to saturation
    # and Soil moisture.
    # ---------------------------------------------------------------#

    #Initiation values.

    main_run_init = utils_sm.spinup(initial_conditions['fa_init'], spinup['num_spin_year'],
                                    spinup['spin_cyc'], initial_conditions['su_init'],
                                    psi_s, theta_s, theta_c, theta_w, b, Ks, initial_conditions['dz'],
                                    initial_conditions['dr'],q1, p, T, initial_conditions['h'], u, dt, initial_conditions['LAI'], spinup['model_t_step'],
                                    spinup['data_period'],P,initial_conditions['er'],initial_conditions['I_v'], gl)

    Su, M, Evap, EvapT, runoff = utils_sm.calc_smcl(main_run_init, psi_s, theta_s, theta_c, theta_w, b, Ks, initial_conditions['dz'],
                                initial_conditions['dr'],q1, p, T, initial_conditions['h'], u, dt, initial_conditions['LAI'], spinup['model_t_step'], spinup['data_period'],P,
                                initial_conditions['er'],initial_conditions['I_v'],gl)

    smcl_histdata = M
    Su_histdata = Su

    rk = utils_sm.root_frac(initial_conditions['dr'], initial_conditions['dz'])

    #    calculate the beta values of each layer (Normal beta value as that of JULES)
    # Beta with readily avilabel soil moisture (using field capacity)(for seedlings)
    #To ask DA: Why is this not an interactive part of the smcl calculation? It is. We re-output beta for the metrics.


    #beta, none_weigh_beta, pfc = utils_sm.cal_av_beta_fc(theta_s, theta_c, theta_w, Su, rk)

    # ------------------------------------------------------------------- #
    # Forecast for soil moisture based on historical driving data
    # The forecast starts from the beginind of the season (day 91 of the year)
    # and run till the end of the next year (remaining plus 365).
    # the results will be written on a netCDF file (out_<forcaststartday>.nc)
    # For the moment we are interested in the first 14 days therefore we
    # run the model from day 58 to day 149.

    # extract the initial soil moisture fraction to start forecast
    initi_su = utils_sm.extract_initial_cond(smcl_histdata, Su_histdata, years, fy_ind, ind)
    fa_val = main_run_init[1]
    main_run_init = np.array([initi_su, fa_val])


    # the start and end date of the required data for forecast
    plantingdates = np.arange(0, 730) #taken from utils.climyears_pdates
    startdate = plantingdates[ind] * 24  # begining of forecast (Just first date since it is a single date forecast, the rest of the date is used for plotting)
    enddate = (plantingdates[ind] + lead_time_days) * 24  # 90 days from the start of forecast this allows to have full coverage of SM forecast in the planting window

    # driving data need to be reshaped to pick any climatology year
    P_resh, p_resh, u_resh, q1_resh, T_resh = utils_sm.reshape_drive_data(P, p, u, q1, T, years)

    #Adding up only the top 3 layers of soil.
    smcl_histdata_total=np.sum(smcl_histdata[0:3],axis=0)
    smcl_histdata=np.vstack((smcl_histdata,smcl_histdata_total))


    rng = pd.date_range(pd.Timestamp(datastartyear,1,1), periods=smcl_histdata.shape[1], freq='D')
    smcl_histdata_df=pd.DataFrame(smcl_histdata.T)
    smcl_histdata_df=smcl_histdata_df.set_index(rng)
    smcl_histdata_df.columns=['layer_1','layer_2','layer_3','layer_4','total']

    values=[]
    yearout=[]
    for g in range(0, len(climayears)):
        # pick the index of the climatological year
        clima_ind = sorted(years).index(climayears[g])
        # add the next year values to make the lenght 2 years incase season goes to next calendar year
        P1 = P_resh[:, clima_ind]  # precipitation (Kg m-2 s-1)
        p1 = p_resh[:, clima_ind]  # pressure (Pa)
        T1 = T_resh[:, clima_ind]  # temperature (K)
        q11 = q1_resh[:, clima_ind]  # specific humidity (Kg Kg-1)
        u1 = u_resh[:, clima_ind]  # wind speed (m s-1)
        # the next year
        P2 = P_resh[:, clima_ind+1]  # precipitation (Kg m-2 s-1)
        p2 = p_resh[:, clima_ind+1]  # pressure (Pa)
        T2 = T_resh[:, clima_ind+1]  # temperature (K)
        q12 = q1_resh[:, clima_ind+1]  # specific humidity (Kg Kg-1)
        u2 = u_resh[:, clima_ind+1]  # wind speed (m s-1)
        # merge the two year data
        P_merg = np.hstack([P1,P2])
        p_merg = np.hstack([p1,p2])
        T_merg = np.hstack([T1,T2])
        q1_merg = np.hstack([q11,q12])
        u_merg = np.hstack([u1,u2])
        # extract the required driving data for the forecast
        P = P_merg[startdate:enddate]  # precipitation (Kg m-2 s-1)
        p = p_merg[startdate:enddate]  # pressure (Pa)
        T = T_merg[startdate:enddate]  # temperature (K)
        q1 = q1_merg[startdate:enddate]  # specific humidity (Kg Kg-1)
        u = u_merg[startdate:enddate]  # wind speed (m s-1)


        # run soil moisture forecast
        Su, M, Evap, EvapT , runoff = utils_sm.calc_smcl(main_run_init, psi_s, theta_s, theta_c, theta_w, b, Ks, initial_conditions['dz'],
                                       initial_conditions['dr'],q1, p, T, initial_conditions['h'], u, dt, initial_conditions['LAI'], spinup['model_t_step'], spinup['data_period'],P,
                                       initial_conditions['er'],initial_conditions['I_v'],gl)

        # root fraction at each soil layer
        rk = utils_sm.root_frac(initial_conditions['dr'], initial_conditions['dz'])

        # calculate the beta values of each layer (Normal beta value as that of JULES)
        # calculate the beta values of each layer (use calc_beta_fc)
        #beta, none_weigh_beta, pfc = utils_sm.cal_av_beta_fc(theta_s, theta_c, theta_w, Su, rk)

        smcl_ensemble_member=M
        #Adding up only the top 3 layers of soil.
        smcl_ensemble_member_total=np.sum(M[0:3],axis=0) #Calculate total soil moisture content of the soil column
        smcl_ensemble_member=np.vstack((smcl_ensemble_member,smcl_ensemble_member_total))

        smcl_ensemble_member_df=pd.DataFrame(smcl_ensemble_member)
        #Make dataframe of historical data up to the day of the forecast
        smcl_histdata_splice=smcl_histdata_df[pd.Timestamp(datastartyear,1,1):pd.Timestamp(cast_date.year,cast_date.month,cast_date.day)][:][0:-1]
        #Make dataframe of ensemble forecast data from the point of forecast until the end of the run
        smcl_ensemble_rng=pd.date_range(pd.Timestamp(cast_date.year,cast_date.month,cast_date.day), periods=lead_time_days, freq='D')
        smcl_ensemble_member_df=pd.DataFrame(smcl_ensemble_member.T)
        smcl_ensemble_member_df=smcl_ensemble_member_df.set_index(smcl_ensemble_rng)
        smcl_ensemble_member_df.columns=['layer_1','layer_2','layer_3','layer_4','total']

        #Splice the historical and ensemble forecast together
        smcl_ensemble_member_df=pd.concat([smcl_histdata_splice,smcl_ensemble_member_df])

        #Calculate ensemble mean soil moisture over the period of interest


        start=pd.Timestamp(poi_start_year,poi_start_month,poi_start_day)
        end=pd.Timestamp(poi_end_year,poi_end_month,poi_end_day)

        yearout.append(years[g])
        values.append(np.nanmean(smcl_ensemble_member_df[start:end]['total']))

    climvalues=[]
    for g in range(0, len(climayears)):
        start=pd.Timestamp(years[g],poi_start_month,poi_start_day)

        if poi_start_month <= poi_end_month:
            end=pd.Timestamp(years[g],poi_end_month,poi_end_day)
        else:
            end=pd.Timestamp(years[g]+1,poi_end_month,poi_end_day)
        climvalues.append(np.nanmean(smcl_histdata_df[start:end]['total']))

    years=yearout

    ensemble_totals=pd.DataFrame(values,years)
    climatological_sums=pd.DataFrame(climvalues,years)

    #forecast_sums=ensemble_totals #placeholder

    risk_prob_plot(clim_start_year, clim_end_year,
                   data.index[0].year, data.index[-1].year,
                   cast_date.year, cast_date.month, cast_date.day,
                   stat, location_name, tercile_weights,
                   climatological_sums, ensemble_totals, forecast_sums,
                   output_dir)

    return pd.DataFrame(values,years),pd.DataFrame(climvalues,years)




#if __name__ == '__main__':
    # Example code
#    kitale_data = pd.read_table("kitale_all_hist.txt", header=None, sep=" ")
#    kitale_data.columns=["sw","lw","pr","snow","temp","P","uwind","vwind","q","Trange"]
#    rng = pd.date_range('1/1/1981', periods=kitale_data.shape[0], freq='D')
#    kitale_data = kitale_data.set_index(rng)

#    tamsat_alert_sm(kitale_data,
#                    kitale_data,
#                    pd.Timestamp(2017,2,1),
#                    'sandy loam',
#                    './outtest/',
#                    1, 3,
#                    30, 5,
#                    1, 3,
#                    30, 5,
#                    200,
#                    tercile_weights=[1,1,1],
#                    clim_start_year=1981, clim_end_year=2017,
#                    poi_start_year=2017, poi_end_year=2017,
#                    norm_not_ecdf=True,
#                    location_name='kitale')
