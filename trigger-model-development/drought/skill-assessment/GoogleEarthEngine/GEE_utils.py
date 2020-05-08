import ee
import pandas as pd

def extract_data_EE(im_col, fe_col,
                    min_year, max_year,
                    min_month, max_month,
                    reducer_time, reducer_space,
                    scale=1000, export=False, reduce_imcol=True):
    """
    Function that can extract and spatial reduce
    the data from the Google Earth Engine.

    It returns a feature collection containing
    the data that is reduced per region.
    """
    # initialize earth engine
    ee.Initialize()

    # create list
    year_data = []

    # since the range works betwen values this compensates so that when you want the max year to be 2018, it will be untill 2019 (thus 2018)
    max_year = max_year + 1
    max_month = max_month + 1

    # from 2010-2018:
    for yNum in range(min_year, max_year):
        month_data = []

        # from january - december
        for mNum in range(min_month, max_month):

            # load data

            if reduce_imcol == True:
                # reduce the image collection to one image:
                imageCol = ee.ImageCollection(im_col).filter(ee.Filter.calendarRange(yNum, yNum, 'year')).filter(
                    ee.Filter.calendarRange(mNum, mNum, 'month'))
                reduceImageCol = imageCol.reduce(reducer_time)  # aggregate over month according to reducer_time

            else:
                # already a single image, no need to reduce:
                reduceImageCol = ee.Image(im_col)

            # load admin levels:
            woreda = ee.FeatureCollection(fe_col)

            # aggregate over admin level according to reducer_space
            imageCol_spatial_reduction = reduceImageCol.reduceRegions(collection=woreda,
                                                                      reducer=reducer_space,
                                                                      scale=scale)

            def newCol(feature):
                feature = feature.set('Year', yNum)
                feature = feature.set('Month', mNum)
                return (feature)

            # add a new column for year to each feature in the feature collection
            polyOut = imageCol_spatial_reduction.map(newCol)

            month_data.append(polyOut)

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
    data_list = []

    # for every (month) feature collection in the year feature collection:
    for data in year_data:

        # since 2018-12 is an empty feature collection at this moment this doesn't exist as so catch this error
        # this might nog be the prettiest solution.
        try:
            features = data.getInfo()['features']
            dict_list = []
        except:
            print("No info, month skipped")
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

    # this takes some time. For 8 years * 12 months it takes around 30 - 60 minutes.

    # for every datapoint in fe_col (feature collection for all years, all months):
    for data in fe_col:

        # dummy variable in order to keep account where the script is and for the key of the dictonairy
        print(start_year)

        # convert to dataframe:
        data = fc_to_df(data)

        try:
            # Concat the dataframes:
            df_dict['{0}'.format(start_year)] = pd.concat(data)
            print('concat')

        except ValueError:
            print('no data to append in {0}, skipping this year'.format(start_year))
            pass

        start_year = start_year + 1

    # Turn dataframe dict to one dataframe:
    df_result = pd.concat(df_dict.values(), ignore_index=True)

    return (df_result)
