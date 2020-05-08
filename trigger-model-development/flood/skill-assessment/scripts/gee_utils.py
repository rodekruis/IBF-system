import ee
import pandas as pd
from geetools import tools
import time
from tqdm import tqdm
import os
from calendar import monthrange
import datetime


def get_gee_data(dataset='UCSB-CHG/CHIRPS/DAILY',
                 name='CHIRPS',
                 country='Uganda',
                 year_start=2000,
                 year_end=2019,
                 output_dir='.'):
    """
        Function that collects data from a GEE dataset, aggregate it per given polygons and save as .csv
    """

    # initialize GEE
    ee.Initialize()

    if output_dir == '.':
        output_dir = '../' + country.lower() + '/input/rainfall'
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)

    # get shapefile of catchments, mapt it to a feature collection
    shapefile = 'users/jacopomargutti/catchment_'+country.lower()
    fe_col = ee.FeatureCollection(shapefile)

    print('start collecting', dataset, 'from Google Earth Engine')
    print('years:', year_start, '-', year_end)
    start_time = time.time()

    # Collect Features:
    fc = extract_data_EE(im_col=dataset, fe_col=fe_col,
                         min_year=year_start, max_year=year_end,
                         min_month=1, max_month=12,
                         reducer_time=ee.Reducer.mean(),
                         reducer_space=[ee.Reducer.mean(), ee.Reducer.max()])

    # Turn feature collection dict to a single dataframe
    df_collection = fcdict_to_df(year_start, fc)
    df_collection = df_collection.groupby(['AREA', 'Day', 'District', 'Month', 'PCODE', 'Year']).first()
    df_collection.to_csv(output_dir + "/" + name + "_data.csv", sep=',')
    print('finish collecting', dataset)
    print("--- %s seconds ---" % (time.time() - start_time))


def extract_data_EE(im_col, fe_col,
                    min_year, max_year,
                    min_month, max_month,
                    reducer_time, reducer_space,
                    export=False):
    """
    Function that can extract and spatially reduce
    the data from Google Earth Engine.
    It returns a feature collection containing
    the data that is reduced per region.
    """

    # create list
    year_data = []

    # since the range works betwen values this compensates so that when you want the max year to be 2018, it will be untill 2019 (thus 2018)
    max_year = max_year + 1
    max_month = max_month + 1

    # loop over years:
    for yNum in tqdm(range(min_year, max_year)):
        month_data = []

        # loop over months
        for mNum in range(min_month, max_month):
            day_data = []

            # loop over days
            monthrange_ = monthrange(yNum, mNum)
            for dNum in range(1, monthrange_[1]):

                date = datetime.datetime(yNum, mNum, dNum)
                # reduce the image collection to one image:
                imageCol = ee.ImageCollection(im_col).filterDate(date.strftime("%Y-%m-%d"))
                # save the scale of first image (need to use it later to save aggregated raster)
                try:
                    image_scale = int(
                        tools.image.minscale(ee.Image(imageCol.toList(imageCol.size().getInfo()).get(0))).getInfo())
                except:
                    continue

                reduceImageCol = imageCol.reduce(reducer_time)

                def newCol(feature):
                    feature = feature.set('Year', yNum)
                    feature = feature.set('Month', mNum)
                    feature = feature.set('Day', dNum)
                    return (feature)

                # aggregate over admin level according to reducer_space
                for reducer in reducer_space:
                    imageCol_spatial_reduction = reduceImageCol.reduceRegions(collection=fe_col,
                                                                              reducer=reducer,
                                                                              scale=image_scale)

                    # add a new column for year to each feature in the feature collection
                    polyOut = imageCol_spatial_reduction.map(newCol)
                    day_data.append(polyOut)

            month_data.append(day_data)

        year_data.append(month_data)

    if export == True:
        # If you want to EXPORT csv to your google drive:
        # Table to Drive Export Example
        mytask = ee.batch.Export.table.toDrive(collection=polyOut,
                                               description='out',
                                               folder=im_col,
                                               fileFormat='CSV')
        ee.batch.data.startProcessing(mytask.id, mytask.config)

    return (year_data)


# function to convert a feature collection to a data frame
def fc_to_df(year_data):
    """
    Function that can convert a feature collection
    created through the google earth engine to a pandas DataFrame
    """
    year_data = [item for sublist in year_data for item in sublist]
    data_list = []

    # for every (month) feature collection in the year feature collection:
    for data in year_data:

        # since 2018-12 is an empty feature collection at this moment this doesn't exist as so catch this error
        # this might nog be the prettiest solution.
        try:
            features = data.getInfo()['features']
            dict_list = []
        except:
            print("No info, day skipped")
            continue
            # return data_list

        # if it contains features, than for every feature add it to a list
        for f in features:
            attribute = f['properties']
            dict_list.append(attribute)

        # when each feature has been done add to list for one month
        df = pd.DataFrame(dict_list)
        data_list.append(df)

    # returning a list with a df for each month of the feature collection
    return data_list


def fcdict_to_df(start_year, fe_col):
    """
    Function that turns a dictionary containing feature collections
    into a dictionary containing data frames.
    """
    # script to add each month in the feature collection to a dictonairy:
    df_dict = {}
    year = start_year
    # this takes some time. For 8 years * 12 months it takes around 30 - 60 minutes.
    print('start processing data (this might take a while)')

    # for every datapoint in fe_col (feature collection for all years, all months):
    for data in tqdm(fe_col):

        # convert to dataframe:
        data = fc_to_df(data)

        try:
            # Concat the dataframes:
            df_dict['{0}'.format(year)] = pd.concat(data)
            print('concat')

        except ValueError:
            print('no data to append in {0}, skipping this year'.format(year))
            pass

        year = year + 1

    # Turn dataframe dict to one dataframe:
    try:
        df_result = pd.concat(df_dict.values(), ignore_index=True)
    except:
        df_result = pd.DataFrame()

    return (df_result)


if __name__ == "__main__":
    get_gee_data()