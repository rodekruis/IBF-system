#!/usr/bin/env python3
"""
This module contains functions for extracting data from multifile NetCDF
datasets, for use in conjunction with the TAMSAT alert system.
"""

import xarray as xr
import pandas as pd
from glob import glob


def _get_dataset(path):
    """
    Creates an xarray dataset from a glob expression

    :param path: A glob expression specifying the location of the data.
                 When full paths are listed, the alphanumeric order of
                 the files must match the time order
    :return: An tuple containing (xarray dataset, name of lon dim, name of lat dim)
    """
    # Construct list of files to use.  These should be alphanumerically ordered
    file_list = sorted(glob(path))

    # Construct an xarray dataset with all of the files
    dataset = xr.open_mfdataset(file_list,
                                decode_times=True,
                                autoclose=True,
                                decode_cf=True,
                                cache=False,
                                concat_dim='time')

    # Determine the name of the lat / lon dimensions
    lon_name = None
    lat_name = None
    for coord_name in dataset.coords:
        try:
            units = dataset.coords[coord_name].attrs['units']
            if(units in ['degrees_north',
                         'degree_north',
                         'degree_N',
                         'degrees_N',
                         'degreeN',
                         'degreesN']):
                lat_name = coord_name
            elif(units in ['degrees_east',
                           'degree_east',
                           'degree_E',
                           'degrees_E',
                           'degreeE',
                           'degreesE']):
                lon_name = coord_name
        except KeyError:
            # Ignore this - it means the units attribute is not present
            pass

    # Decode CF metadata (this is quick, but creates a new dataset)
    return dataset, lon_name, lat_name


def extract_point_timeseries(path, lon, lat):
    """
    Extracts a timeseries from a set of NetCDF files at a specified location.

    :param path: A glob expression specifying the location of the data.
                 When full paths are listed, the alphanumeric order of
                 the files must match the time order
    :param lon: The longitude at which to extract a timeseries
    :param lat: The latitude at which to extract a timeseries
    :return: A pandas DataFrame containing all variables present in the NetCDF dataset
    """

    dataset, lon_name, lat_name = _get_dataset(path)

    # Select nearest neighbour to co-ordinate of interest, for all variables
    timeseries = dataset.sel({
        lon_name: lon,
        lat_name: lat
    }, method='nearest')

    # Create a pandas DataFrame from the selected data
    # This is where the extraction happens
    # Multiplying by 1.0 reduces memory usage enormously.
    #
    # The reason for this is a bit of a mystery, but I suspect
    # that without it, it is loading the entire dataset into memory
    # and returning a view onto that dataset.
    #
    # With it, it no longer considers the rest of the dataset to be
    # relevant, so it throws it away.
    df = (timeseries*1.0).to_dataframe()

    return df


def extract_area_mean_timeseries(path, minlon, maxlon, minlat, maxlat):
    """
    Extracts a timeseries from a set of NetCDF files averaged over a specified region.

    :param path: A glob expression specifying the location of the data.
                 When full paths are listed, the alphanumeric order of
                 the files must match the time order
    :param minlat: The minimum latitude of the region over which to extract a timeseries
    :param maxlat: The maximum latitude of the region over which to extract a timeseries
    :param minlon: The minimum longitude of the region over which to extract a timeseries
    :param maxlon: The maximum longitude of the region over which to extract a timeseries
    :return: A pandas DataFrame containing all variables present in the NetCDF dataset
    """
    dataset, lon_name, lat_name = _get_dataset(path)

    ln = dataset.coords[lon_name]
    lt = dataset.coords[lat_name]

    subset = dataset.loc[{
        lon_name: ln[(ln >= minlon) & (ln <= maxlon)],
        lat_name: lt[(lt >= minlat) & (lt <= maxlat)]
        }]
    # Take the mean over the lon/lat dimensions
    timeseries = subset.mean(dim=(lon_name, lat_name), skipna=True)

    # Create a pandas DataFrame from the selected data
    # This is where the extraction happens
    df = timeseries.to_dataframe()

    return df
