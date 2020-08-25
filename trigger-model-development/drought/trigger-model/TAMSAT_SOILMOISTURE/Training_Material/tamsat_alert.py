import numpy as np
import pandas as pd
from collections import OrderedDict
from tamsat_alert.tamsat_alert_plots import risk_prob_plot


def tamsat_alert(fc_data,
                 met_ts_varname,
                 data,
                 cast_date,
                 var_of_interest,
                 output_dir,
                 poi_start_day, poi_start_month,
                 poi_end_day, poi_end_month,
                 fc_start_day, fc_start_month,
                 fc_end_day, fc_end_month,
                 precipitation_rate_str='pr', #ECB added in precipitation_rate_str and temperature_str as defaults to be set in the back end. These allow the meteorological forecast variable to be set by the user.
                 temperature_str='temp',
                 tercile_weights=[1,1,1],
                 clim_start_year=None, clim_end_year=None,
                 poi_start_year=None, poi_end_year=None,
                 stat_type='normal',
                 cum_not_mean=True,
                 run_start=None, run_end=None,
                 location_name=None):
    '''
    Generates the data and plots for the cumulative rainfall part of TAMSAT Alert.

    :param fc_data:         A pandas DataFrame containing the data to use for providing
                            meteorological forecast time series to inform the allocation of ensemble member weights. This should be an area averaged time series for each of the driving variables.
    :param met_ts_varname:  A string indicating whether the meteorological forecast is for temperature or for precipitation. Acceptable values are:
                            'precipitation','temperature'
    :param data:            A pandas DataFrame containing the data to use for running
                            the TAMSAT alert code
    :param cast_date:       The date at which to start fore/hind-cast.
                            This should be a pandas Timestamp object
    :param var_of_interest: The variable of interest.  Must be a column in data
    :param output_dir:      The path at which to output data and plots
    :param poi_start_day:   The day of the month of the start of the period of interest
    :param poi_start_month: The month of the year of the start of the period of interest
    :param poi_end_day:     The day of the month of the end of the period of interest
    :param poi_end_month:   The month of the year of the end of the period of interest
    :param fc_start_day:    The day of the month of the start of the meteorological forecast
    :param fc_start_month:  The month of the year of the start of the meteorological forecast
    :param fc_end_day:      The day of the month of the end of the meteorological forecast
    :param fc_end_month:    The month of the year of the end of the meteorological forecast
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
    :param stat_type:       The probability distribution to use for percentile calculations
                            Accepted values are 'normal' and 'ecdf'
                            Optional, defaults to 'normal'
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
    '''

    # Set defaults for any missing optional args
    if clim_start_year is None:
        clim_start_year = data.index[0].year
    if clim_end_year is None:
        clim_end_year = data.index[-1].year

    if poi_start_year is None:
        poi_start_year = data.index[0].year
    if poi_end_year is None:
        poi_end_year = data.index[-1].year

    arbitrary_year = 2000

    #ECB added this section of code to detect whether the desired period crosses a year and adjust the run_start and run_end accordingingly.
    #This is necessary later on for init_ensemble_members
    start_date = pd.Timestamp(
        arbitrary_year, poi_start_month, poi_start_day)
    end_date = pd.Timestamp(
        arbitrary_year, poi_end_month, poi_end_day)
    poi_crosses_year = start_date > end_date


    if run_start is None:
        #If we cross a year boundary and we are in the first year
        if poi_crosses_year and cast_date.month > poi_end_month:
            run_start = pd.Timestamp(cast_date.year, 1, 1)


        #If we cross a year boundary and we are in the second year
        elif poi_crosses_year and cast_date.month < poi_end_month:
            run_start = pd.Timestamp(cast_date.year-1, 1, 1)

        #If we do not cross a year boundary
        else:
            run_start=pd.Timestamp(cast_date.year,1,1)

    if run_end is None:
        if poi_crosses_year and cast_date.month > poi_end_month:
            run_end = pd.Timestamp(cast_date.year+1, 12, 31)
        elif poi_crosses_year and cast_date.month < poi_end_month:
            run_end = pd.Timestamp(cast_date.year, 12, 31)
        else:
            run_end=pd.Timestamp(cast_date.year+1,12,31)



    if(location_name is None):
        try:
            location_name = data[data.index[0]].lon+','+data[data.index[0]].lon
        except:
            location_name = ''

    # Sanity check
    if(cast_date < run_start or cast_date > run_end):
        raise ValueError('cast_date must fall between run_start and run_end')

    # Select only the data we want to deal with
    data = data[var_of_interest]
    #ECB Select the the meteorological time series (precipitation or temperature) for the meteorological forecast time series
    if met_ts_varname == "precipitation":
        tmp = fc_data[precipitation_rate_str]
    if met_ts_varname == "temperature":
        tmp = fc_data[temperature_str]
    fc_data_no_leaps = strip_leap_days(tmp)

    # Remove leap years from data
    # This is so that when we construct ensemble members from historical runs,
    # they will all be guaranteed to have the same length.
    #
    # If there are already no leap years in the data, this will return an identical
    # pandas dataframe
    data_no_leaps = strip_leap_days(data)


    # Initialise the ensemble members.  This returns an OrderedDict mapping
    # ensemble member years (as ints) to the data
    ensemble_members = init_ensemble_data(
        data, data_no_leaps, cast_date, run_start,
        run_end, clim_start_year, clim_end_year)

    # Sum the ensemble members.  This returns a DataFrame with ensemble
    # years as the index, and the variables of interest as the columns.
    # Values are the sums of the ensemble members over the FIRST occurrence
    # of the period of interest date range
    ensemble_totals = sum_ensemble_members(
        ensemble_members, poi_start_day, poi_start_month,
        poi_end_day, poi_end_month)

    # Pick which operation to perform on the ensemble members
    if cum_not_mean:
        operation = np.sum
    else:
        operation = np.mean

    # Calculate the timeseries for the two desired periods
    climatological_sums = ensemble_timeseries(data_no_leaps,
                                        poi_start_day,
                                        poi_start_month,
                                        poi_end_day,
                                        poi_end_month,
                                        poi_start_year,
                                        poi_end_year,
                                        operation)

    #ECB adjusted to read in fc_data with no leap years
    forecast_sums = forecast_timeseries(fc_data_no_leaps,
                                        fc_start_day,
                                        fc_start_month,
                                        fc_end_day,
                                        fc_end_month,
                                        poi_start_year,
                                        poi_end_year,
                                        cast_date,
                                        operation)


    # This has been only very slightly modified from its original state
    # It now takes the DataFrames rather than filenames, and and output dir,
    # but is otherwise the same as in the old version.


    risk_prob_plot(clim_start_year, clim_end_year,
                   data.index[0].year, data.index[-1].year,
                   cast_date.year, cast_date.month, cast_date.day,
                   poi_start_month, poi_start_day,poi_end_month,poi_end_day,
                   stat_type, location_name, tercile_weights,
                   climatological_sums, ensemble_totals, forecast_sums,
                   output_dir)


def strip_leap_days(data):
    '''
    Removes leap days from a dataset

    :param data: A pandas DataFrame containing the data to remove leap years from
    :return: A copy of the same pandas DataFrame, with all values occurring
             on the 29th February removed
    '''
    stripped_data = data.drop(
        [date for date in data.index
            if (date.month == 2 and date.day == 29)])

    return stripped_data


def init_ensemble_data(data, no_leap_data, cast_date, run_start, run_end, ensemble_start_year, ensemble_end_year, retain_leaps=True):
    '''
    Takes the data and extracts ensemble members for each year.

    Each ensemble member consists of:

    * The SAME spinup data which is data from the period from run_start to cast_date
    * The data from the cast_date of the ensemble year, up to the run_end date of
            the ensemble year.

    i.e. It is a bunch of timeseries which start the same, but then vary going forward
    from the (fore/hind)cast date

    :param data:                The timeseries data
    :param no_leap_data:        The timeseries data, with leap days removed
    :param cast_date:           The (fore/hind)cast date
    :param run_start:           The date to start ensemble runs
    :param run_end:             The date to end ensemble runs
    :param ensemble_start_year: The first year in the data to construct an
                                ensemble run from
    :param ensemble_end_year:   The last year in the data to construct an
                                ensemble run from
    :param retain_leaps:        If True, keeps leap days in the spinup data
                                Optional, defaults to True

    :return:                    An OrderedDict whose keys are the ensemble years
                                and whose values are pandas DataFrames containing
                                the ensemble data
    '''



    spinupdata = data if retain_leaps else no_leap_data

    spinup = spinupdata.loc[np.logical_and(
        spinupdata.index >= run_start, spinupdata.index < cast_date)]

    # Return an ordered dictionary of ensemble members (i.e. years) to pandas dataframes
    ret = OrderedDict()

    # Calculate number of days to run after cast date
    n_days = (run_end - cast_date).days

    # MY: Have to check if cast_date crosses year
    crosses_year = cast_date.year > run_start.year

    for year in np.arange(ensemble_start_year, ensemble_end_year + 1):
        # For every ensemble year, take subset of no leap data FROM:
        # The cast date in ensemble year
        # TO
        # The run_end date in ensemble year
        # MY: Need to check if cast date crosses year to obtain correct data
        #  when cast date after year boundary
        # If cast date before year boundary, the data is already representative
        # of year to year + 1
        # However, if cast date after the year boundary, need to shift start
        # date from ensemble_year to ensemble_year + 1 to get correct data.
        if crosses_year == False:
          start_date = pd.Timestamp(year, cast_date.month, cast_date.day)
        elif crosses_year == True:
          start_date = pd.Timestamp(year+1,cast_date.month,cast_date.day)
        # start_date = pd.Timestamp(year, cast_date.month, cast_date.day)
        end_date = start_date + pd.Timedelta(days=n_days)
        ensemble_range = np.logical_and(
            no_leap_data.index >= start_date,
            no_leap_data.index <  end_date
        )
        ret[year] = pd.concat([spinup, no_leap_data.loc[ensemble_range]])
    return ret


def sum_ensemble_members(members, start_day, start_month, end_day, end_month):
    '''
    Calculates the sum of the values in each ensemble member ranging
    from the first occurrence of (start_day, start_month) to the next
    occurrence of (end_day, end_month), inclusive.

    :param members:     An OrderedDict containing ensemble years mapped to
                        pandas DataFrames with ensemble data
    :start_day:         The day of the month at which to start the sum over
    :start_month:       The month of the year at which to start the sum over
    :end_day:           The day of the month at whose first occurrence to
                        end the sum
    :end_month:         The month of the year at whose first occurrence to
                        end the sum

    :return:            A DataFrame whose index is the keys of members, and
                        whose values are the calculated sums
    '''

    values = []
    for member in members:
        data = members[member]

        # Calculate the indices within this dataframe to sum over
        start_index = 0
        end_index = 0
        # We want the first date matching the start day & month
        for i, date in enumerate(data.index):
            if(date.month == start_month and date.day == start_day):
                start_index = i
                break
        # We want the next date matching the end day & month,
        # hence we slice the data from the start_index
        for i, date in enumerate(data.index[start_index:]):
            if(date.month == end_month and date.day == end_day):
                # We need to add the start_index to i,
                # since enumerate() will start the index from 0
                end_index = i + start_index
                break

        # Now slice the data between the desired indices, and sum
        values.append(data[start_index : end_index].sum())
    return pd.DataFrame(values, members)


def ensemble_timeseries(data_no_leaps, start_day, start_month, end_day, end_month, start_year, end_year, operation):
    '''
    For each year between start_year and end_year, performs the operation
    on data ranging from the start date (start_day/start_month),
    to the end date (end_day/end_month) of that year.

    If the start-end dates cross the year boundary, the year is defined as the
    year at the start date.

    :param data_no_leaps:   A pandas DataFrame containing the data, with leap days removed
    :param start_day:       The day of the month to start operating on
    :param start_month:     The month of the year to start operating on
    :param end_day:         The day of the month to stop operating on (exclusive)
    :param end_month:       The month of the year to stop operating on (exclusive)
    :param start_year:      The first year to perform the operation on
    :param end_year:        The last year to perform the operation on.
    :param operation:       The operation to perform.  Should be a function (e.g. np.sum)

    :return:                A pandas DataFrame containing years as the index, and
                            the results of the operation as the values
    '''

    # This should be a leap year, to ensure we will have a valid date
    # Otherwise it is completely arbitrary, and only used to check
    # whether the range spans the year boundary.
    arbitrary_year = 2000

    # Detect whether the desired period crosses a year
    start_date = pd.Timestamp(
        arbitrary_year, start_month, start_day)
    end_date = pd.Timestamp(
        arbitrary_year, end_month, end_day)
    crosses_year = start_date > end_date


    #ECB: commented out this so that our ensemble members, forecast members and climatological members are calculated consistently. This is especially crucial that the forecast_members and ensemble_members are the same length.

    #if(crosses_year):
    #    years = np.arange(start_year, end_year)
    #else:
    #    years = np.arange(start_year, end_year + 1)

    years = np.arange(start_year,end_year+1)
    values = []
    for year in years:
        start = pd.Timestamp(year, start_month, start_day)

        # We need to increment the year if the dates cross the year boundary
        before_end_year = year
        if crosses_year:
            before_end_year = year + 1
        end = pd.Timestamp(
            before_end_year, end_month, end_day)

        if(end > data_no_leaps.index[-1]):
            # In this case, the end point falls outside the data range
            # This would lead to truncated data, so we do not perform the
            # operation.  This will also be true for all following years,
            # hence we use break, rather than continue
            break

        # Subset the data to extract the desired period for the current year
        subset = data_no_leaps.loc[np.logical_and(
            data_no_leaps.index >= start,
            data_no_leaps.index < end,
        )]

        # Perform the operation (usually np.sum() or np.mean() on the subset)
        values.append(operation(subset))

    return pd.DataFrame(values, years)

def forecast_timeseries(data_no_leaps, start_day, start_month, end_day, end_month, start_year, end_year, cast_date, operation):
    '''
    For each year between start_year and end_year, performs the operation
    on data ranging from the start date (start_day/start_month),
    to the end date (end_day/end_month) of that year.

    If the start-end dates cross the year boundary, the year is defined as the
    year at the start date.

    :param data_no_leaps:   A pandas DataFrame containing the data, with leap days removed
    :param start_day:       The day of the month to start operating on
    :param start_month:     The month of the year to start operating on
    :param end_day:         The day of the month to stop operating on (exclusive)
    :param end_month:       The month of the year to stop operating on (exclusive)
    :param start_year:      The first year to perform the operation on
    :param end_year:        The last year to perform the operation on.
    :param operation:       The operation to perform.  Should be a function (e.g. np.sum)

    :return:                A pandas DataFrame containing years as the index, and
                            the results of the operation as the values
    '''

    # This should be a leap year, to ensure we will have a valid date
    # Otherwise it is completely arbitrary, and only used to check
    # whether the range spans the year boundary.
    arbitrary_year = 2000

    # Detect whether the desired period crosses a year
    start_date = pd.Timestamp(
        arbitrary_year, start_month, start_day)
    end_date = pd.Timestamp(
        arbitrary_year, end_month, end_day)
    crosses_year = start_date > end_date


    #ECB: commented out this so that our ensemble members, forecast members and climatological members are calculated consistently. This is especially crucial that the forecast_members and ensemble_members are the same length.

    #if(crosses_year):
    #    years = np.arange(start_year, end_year)
    #else:
    #    years = np.arange(start_year, end_year + 1)

    years = np.arange(start_year,end_year+1)

    #If forecast period crosses the year
    if crosses_year:
        #If the cast date is in year +1 and is within the forecast period, the year in question is for year - 1. For example, if the cast date is January 10th 1983, a DJF forecast should start in December 1982, NOT December 1983
        if cast_date.month <= end_month:
            years=years-1

    #If forecast period does not cross the year
    if crosses_year == False:
        #As the forecast period does not cross the year, we assume initially that the year of the forecast is the same as the year of the cast
        end_date = pd.Timestamp(cast_date.year,end_month,end_day)
        #With the assumption above, we now test to see whether the cast date is after the end of the forecast period. If it is, the forecast period is pushed to the next year.
        if cast_date >= end_date:
            years = years+1

    values = []
    for year in years:
        start = pd.Timestamp(year, start_month, start_day)

        # We need to increment the year if the dates cross the year boundary
        before_end_year = year
        if crosses_year:
            before_end_year = year + 1
        end = pd.Timestamp(
            before_end_year, end_month, end_day)

        if(end > data_no_leaps.index[-1]):
            # In this case, the end point falls outside the data range
            # This would lead to truncated data, so we do not perform the
            # operation.  This will also be true for all following years,
            # hence we use break, rather than continue
            break

        # Subset the data to extract the desired period for the current year
        subset = data_no_leaps.loc[np.logical_and(
            data_no_leaps.index >= start,
            data_no_leaps.index < end,
        )]

        # Perform the operation (usually np.sum() or np.mean() on the subset)
        values.append(operation(subset))

    return pd.DataFrame(values, years)
