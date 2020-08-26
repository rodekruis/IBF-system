'''
This code will perform the entire pipeline to get the latest data for drought monitoring
'''
import glob
import numpy as np
import pandas as pd
from owslib.wfs import WebFeatureService
import geopandas as gpd
import h5py
import os
import requests
from requests.auth import HTTPBasicAuth
import tqdm
import rasterio
import rasterio.mask
import rasterio.features
from sklearn.preprocessing import StandardScaler
import datetime as dt
import shutil
import warnings
import tables
warnings.simplefilter("ignore", category=tables.NaturalNameWarning)


##################
#  main function #
##################
def update_dataset():
    # --- initiate settings ---
    mySettings = Settings()

    # --- output file name ----
    output_file = mySettings.output_file


    # --- get the shapefile data ---
    print('\n'*3)
    print("Downloading shapefile from GeoNode.....")
    # TODO: Change this back once the certificate is up again
    # shapefile_filename = download_shapefile(mySettings)
    # shape_file = os.path.join(mySettings.temporary_folder, shapefile_filename
    shapefile_filename = 'eth_adm1_mapshaper_reproj.geojson'
    shape_file = os.path.join( 'shape_files',shapefile_filename )

    # --- get the satelite data ---
    for collection in mySettings.indicators:
        print("Downloading %s from Copernicus...." %(collection))
        download_Copernicus(username=mySettings.CopernicusLogin[0],
                            password=mySettings.CopernicusLogin[1],
                            path=mySettings.temporary_folder,
                            start_date=mySettings.start_date,
                            stop_date=mySettings.stop_date,
                            collection=collection)


        rasterFileDir = os.path.join(mySettings.temporary_folder, collection)
        if  os.listdir(rasterFileDir):
            print("Update data table for %s ..." %(collection))
            update_indicator(collection,shape_file, mySettings)
        else:
            print("%s already up to date" %(collection))
            continue

    # --- write metadata into HDF5-file ----
    with h5py.File(output_file, mode='a') as output:
        adminData = output[ mySettings.admin_lvl ]
        adminData.attrs["last_updated"] = str(mySettings.stop_date)

    # --- Delete the contents of the temporary folder ----
    if os.path.exists(mySettings.temporary_folder):
        shutil.rmtree(mySettings.temporary_folder )

    return

################################################################################################
#      Utility functions below
#  (sorted by the step in pipeline they are used for )



##################################
# General utils                  #
##################################
class Settings():
    '''
    Global variables used in the code

    @Sjoerd: If you had another (preferred) solution: Probably even better :-).
    '''
    def __init__(self,
                 temporary_folder=None,
                 zonal_statistic=np.mean,
                 ):

        # --- ask for user inputs ---
        country = input("country (3 letter code): ").lower()
        admin_lvl = input("admin level (i.e.: adm1, adm2,...):" )
        nmbr_indicators = int( input("Number of indicators to update: ") )
        copernicus_products = []
        for n in range(nmbr_indicators):
            new_product = input("Copernicus product (i.e. dmp_v2_1km): " )
            copernicus_products.append(new_product)

        start_date_download = input("download from YYYY-MM-DD (OPTIONAL. Hit return key for default): ")
        stop_date_download  = input("download until YYYY-MM-DD (OPTIONAL. Hit return key for default): ")
        UserName = input("Copernicus username: ")
        PassWord = input("Copernicus password for user %s: " % (UserName))

        # --- main settings ----
        self.country = country
        self.admin_lvl = admin_lvl
        self.indicators = copernicus_products
        self.zonal_statistic = zonal_statistic



        # --- location of output data (create if not existing yet) ----
        baseName = '_'.join([self.country, 'meteorological_drought_indicators.hdf5'])
        output_folder = os.path.join(os.getcwd(), 'processed_data')
        self.output_file = os.path.join(os.getcwd(), 'processed_data',baseName)

        # --- create the folder for output data (if not existing already) ----
        if not os.path.exists(output_folder):
            os.mkdir(output_folder)

        # --- location all the files from Copernicus, GeoNode + initial dataframe will be stored (temporarilly) ---
        if temporary_folder:
            self.temporary_folder = temporary_folder
        else:
            self.temporary_folder = os.path.join(os.getcwd(), 'temp')

        # create if not existing yet
        if not os.path.exists(self.temporary_folder):
            os.mkdir(self.temporary_folder)



        # --- login for Copernicus ---
        self.CopernicusLogin = (UserName, PassWord)

        # --- range of dates you want to get the satelite data for ----
        # start date : manual
        if start_date_download:
            year=int(start_date_download.split('-')[0])
            month=int(start_date_download.split('-')[1])
            day=int(start_date_download.split('-')[2])
            self.start_date =dt.date(year, month,day)

        # start date: infer from last time you used this code (default)
        else:
            #  Get date you last updated the dataset
            with h5py.File(self.output_file, 'r') as f:
                g = f[self.admin_lvl]
                latest_update = g.attrs['last_updated']
                year = int(latest_update.split('-')[0])
                month= int(latest_update.split('-')[1])
                day = int(latest_update.split('-')[2])
                self.start_date = dt.date(year, month, day)


        # stop date: manual
        if stop_date_download:
            year = int(stop_date_download.split('-')[0])
            month = int(stop_date_download.split('-')[1])
            day = int(stop_date_download.split('-')[2])
            self.stop_date = dt.date(year, month, day)

        # stop date: until today  (default)
        else:
            self.stop_date = dt.date.today()




def update_indicator(collection, shape_file,mySettings):
    '''
    Produces an updated dataset within the HDF5-file (master data file) with updated time-series information

    :param indicator:
    :param shape_file:
    :param output_file:
    :param mySettings:
    :return:
    '''

    # --- unpack ---
    output_file = mySettings.output_file
    indicator = collection.split('_')[0].upper()


    # --- perform zonal statistics ---
    print("Performing zonal statistics (and masking of croplands)....")
    zonalstatsFile = '_'.join(['zonalstats_per_date',indicator]) + '.hdf5'
    temp_zonalstats_file = os.path.join(mySettings.temporary_folder, zonalstatsFile)
    folder_raster_files = os.path.join(mySettings.temporary_folder, collection)
    for raster_file in glob.glob(os.path.join(folder_raster_files, '*.nc')):
        ZonalStats, _, _ = extract_zonal_stats(file_shapes=shape_file,
                                               file_raster=raster_file,
                                               collection=collection,
                                               settings=mySettings
                                               )

        # --- write this to the master data file ---
        timestamp = decode_date_from_string(raster_file)
        ZonalStats.to_hdf(temp_zonalstats_file, key=str(timestamp), mode='a')

    # --- create time series data ----
    print("Create time series data table....")
    create_timeseries(temp_zonalstats_file, mySettings.admin_lvl, indicator, output_file)

    # --- normalize quantities and update time series data (take output_file in and append the collumn to it) ----
    print("Calculate normalized data by date and district...")
    normalize_indicator(output_file, mySettings.admin_lvl, indicator)
    print('Completed update for ', indicator, ' and wrote to file ', output_file, ' in dataset ',
          '_'.join([mySettings.admin_lvl, indicator]))
    return




############################
#  shapefile from GeoNode  #
############################
def download_shapefile(mySettings):
    '''
    Retrieve shapefile data from Geonode server.
    Store a 'GeoJSON' file (GeoDataFrame) in temporary folder that contains the
    IDs of the boundaries and the shapes/polygons.

    :param mySettings:
    :return:
    '''

    # --- Ask if possible to make one uniform naming for shapefiles ---
    country = mySettings.country
    admin_lvl = mySettings.admin_lvl
    layer_id = 'geonode:'+ '_'.join([country, admin_lvl, 'mapshaper','reproj'])

    wfs_url = 'https://geonode.510.global/geoserver/geonode_old/ows'
    wfs = WebFeatureService(wfs_url)
    wfs = WebFeatureService(wfs_url, version='1.0.0')

    # Get the actual data
    binary_data = wfs.getfeature(typename=layer_id, outputFormat='application/json')

    # write to file
    shapefile_filename =layer_id.replace('geonode:', '') + '.geojson'
    shapefile_filename = os.path.join(mySettings.temporary_folder, shapefile_filename )
#     with open(shapefile_filename, 'wb') as shapefile:
    with open(shapefile_filename, 'w') as shapefile:
        shapefile.write(binary_data.read())
    return shapefile_filename


##############################
#  Copernicus satelite data  #
##############################

def decode_date_from_string(fullString):
    '''
    use filenames from Copernicus download links to get the corresponding date that data has been recorded
    We can use logic statements with "datetime.date()" objects in Python. Hence, after decoding the date from filename,
    we can easily compare this date against any desired (range of) dates.

    :param: complete download link
    :return: Python datetime.date() object
    '''

    # --- it is in the file's name (the cases are to enable to use either download link or the file name as input) ---
    try:
        fileName = os.path.basename(fullString).decode('utf-8')
    except:
        fileName = os.path.basename(fullString)

    # --- date is now encoded after the 3rd '_' ---
    timestamp = fileName.split('_')[3]
    year = int(timestamp[:4])
    month = int(timestamp[4:6])
    day = int(timestamp[6:8])
    return dt.date(year, month, day)


def get_download_links_Copernicus(collection):
    productlink = "https://land.copernicus.vgt.vito.be/manifest/" + collection + "/manifest_cgls_" + collection + "_latest.txt"
    req = requests.get(productlink, allow_redirects=True)
    # TODO: this should throw an error when the page with productlinks does not exist, e.g.
    # https://land.copernicus.vgt.vito.be/manifest/dmp_v2_1km/daily_update_manifest_cgls_dmp_v1_1km_latest.txt
    return req.content.split()


def download_Copernicus(path, username, password, start_date, stop_date,collection='lai_v1_1km'):
    '''
    Download data from Copernicus satellite and store the netCDF files
    '''
    # --- make output folder in case it does not exist yet ---
    output_folder = os.path.join(path, collection)
    if not os.path.exists(output_folder):
        os.mkdir(output_folder)

    # --- get the list of available products/rasterfiles ---
    download_links = get_download_links_Copernicus(collection)


    for link in download_links:
        # --- check if you need to download this file  (based on date) ----
        measurement_date = decode_date_from_string(link)

        if (measurement_date <= start_date) or (measurement_date > stop_date):
            # No need to download this data
            continue

        # --- if you failed the previous check, this means you want to download this file ---- 
        filename_from_link = os.path.basename(link)
        output_file_name = os.path.join(output_folder, filename_from_link.decode('utf-8'))
        if not os.path.isfile(output_file_name):
            print("\t" "downloading data from: ", measurement_date)
            req = requests.get(link, auth=HTTPBasicAuth(username, password))

            with open(output_file_name, 'wb') as outfile:
                outfile.write(req.content)
    return

################################################
#  land coverage /usage (GlobCover)            #
################################################
level_maps = {0:0, #misc category
              14: 1, # See legend.xlsx of Globcover 2009: avg pct of land used for crops
              20: 0.6,# See legend.xlsx of Globcover 2009: avg pct of land used for crops
              30: 0.35,# See legend.xlsx of Globcover 2009: avg pct of land used for crops
              210: -1, # Water
             }
              
def read_land_use_map():
    '''
    Globcover 2009 should be recovered from geonode, but right now it's not there, so it should be downloaded manually
    from http://due.esrin.esa.int/page_globcover.php'''          
    
    file_land_use_map = os.path.join('Globcover2009_V2.3_Global_','GLOBCOVER_L4_200901_200912_V2.3.tif')
    dataset = rasterio.open(file_land_use_map)
    return dataset

def get_shapes_of_cropland(map_land_use, shape_district, level_maps, min_pct_landuse):
    '''
    Outputs shapefiles of the parts of a shapefile which are used for a specific purpose
    :param worldmap_land_use: a map with a code for every type of land use
    :param shape_district: a shape for which we want to return the cropland
    :param level_maps: a dictionary which maps every code from  the land use map to a value for which percentage is used for the specific reason
    :param min_pct_landuse: the percentage for which we still accept is as being used for this purpose
    
    :return: generator of shapefiles where the statistic should be calculated
    '''
    
    out_image, out_transform = rasterio.mask.mask(map_land_use, [shape_district], crop=True)
    land_use_image = out_image[0]
    condlist = [land_use_image == k for k in level_maps.keys()]
    choicelist = [v for v in level_maps.values()]
    data = np.select(condlist, choicelist, default=-0.01)
    mask = data > min_pct_landuse
    shapes = list(rasterio.features.shapes(land_use_image, mask=mask, transform=out_transform))
    # Shapes returns a generator of tuple(shape, value) - we don't care about the value, only about the shape
    # So select only first part of the tuple
    return [t[0] for t in shapes]




################################################
#  perform zonal statistics                    #
################################################

def extract_zonal_stats(file_shapes, file_raster, collection, settings,
                        minval=-np.inf,
                        maxval=np.inf):
    # --- initialize ----
    zonal_stats = []
    df_out = pd.DataFrame()

    # --- open the shape file and acces wanted info ----
    shapeData = gpd.read_file(file_shapes)
    shapes = list(shapeData['geometry'])
    #TODO: discuss with Akli / 510 team if a uniform naming convention can be assumed
#     names = list(shapeData['name'] )
#     pcodes = list(shapeData['pcode'])
    names = list(shapeData['REGIONNAME'])
    pcodes = list(shapeData['REG_Pcode'])
    
    #--- use rasterio to read the satelite image (raster data/vector image) ----
    # --- Copernicus stores the dataset as "DMP", "LAI", "VCI" in netCDF. The product name contains "dmp", "vci",... ---
    variable = collection.split('_')[0].upper()
    file_location = os.path.join(settings.temporary_folder, collection, file_raster)
    land_use_map = read_land_use_map()
    pct_min_crops = 0.2 # This should be determined together with SMEs

    dataset_ID = 'netcdf:' + file_location + ':' + variable
    with rasterio.open(dataset_ID, 'r') as src:
        # --- loop over admin boundaries (original boundaries) ---
        for shape in tqdm.tqdm(shapes):
            # --- get a set of 'new shapes' that form the subset of area used for crops ---
            crop_shapes = get_shapes_of_cropland(land_use_map, shape, level_maps, pct_min_crops)

            # --- use new shape to perform masking/zonal statistic ----
            out_image, out_transform = rasterio.mask.mask(src, crop_shapes, crop=True)

            # --- show the masked image (shows non-zero value within boundaries, zero outside of boundaries shape) ----
            img = out_image[0, :, :]

            # --- Only use physical values  ----
            data = img[(img >= minval) & (img <= maxval)]

            # --- determine metric: Must be a one-number metric for every polygon ---
            zonal_stats.append(settings.zonal_statistic(data))
    # --- store results into dataframe ---
    df_out['pcode'] = pcodes
    df_out['area'] = names
    df_out['zonal_statistic'] = zonal_stats
    return df_out, data, img



############################################################
#  post-process data and create output DataFrame           #
############################################################
def create_timeseries(file,admin_lvl, indicator, output_file):
    # ---Create list with all dates---
    dates = []
    with h5py.File(file, 'r') as f:
        for key in f.keys():
            dates.append(key)

    # ---Read in the data from the hdf5 file and convert it into one big dataframe
    update_data=pd.DataFrame()
    for date in dates:
        df=pd.read_hdf(file,key=date)
        timestamp = date.split('-')
        year = int(timestamp[0])
        month = int(timestamp[1])
        day = int(timestamp[2])
        df['year'] = year
        df['month'] = month
        df['day'] = day
        df['date'] = str( dt.date(year, month, day) )
        update_data=pd.concat([update_data,df])
    update_data.rename({"zonal_statistic": indicator}, axis='columns', inplace=True)


    # --- Add the new data (current update) to existing dataset ---
    if os.path.isfile(output_file):
        try:
            # -- load the existing datatable ---
            existing_data = pd.read_hdf(output_file, key='/'.join([admin_lvl, indicator]))
            existing_data.reset_index(drop=True, inplace=True)

            # -- combine with update ---
            complete_data = pd.concat([existing_data,update_data],sort=True)
            complete_data.reset_index(drop=True, inplace=True)
        except KeyError:
            print("\t" + "adding %s dataset to existing file" %(indicator))
            complete_data = update_data

    else:
        complete_data = update_data

    # ---Sort the dataframe by regioname and date and save in a hdf5 file
    complete_data=complete_data.sort_values(by=['area','date'])
    complete_data.reset_index(drop=True, inplace=True)
    complete_data.to_hdf(output_file, key='/'.join([admin_lvl, indicator]))
    return


def normalize_indicator(filename,admin_lvl,indicator):
    df= pd.read_hdf(filename, key='/'.join([admin_lvl, indicator]))
    normed_data=pd.DataFrame()

    for i, group in df.groupby(by=['area','month','day']):
        Z = StandardScaler()
        Z.fit(group[[indicator]])
        normed_indicator = Z.transform(group[[indicator]])

        # --- add new collumn to this dataframe ---
        sub_data = group.copy()
        sub_data[str(indicator)+'_normed'] = normed_indicator
        normed_data=pd.concat([normed_data,sub_data])

    # --- set back with original ordering to plot time series ---
    normed_data.sort_values(by=['area','date'],inplace=True)

    # --- rename and reorder some the columns for easier reading ---
    normed_data = normed_data[["pcode", "area", "year", "month", "day", "date", indicator, str(indicator)+'_normed']]

    # --- overwrite hdf5 file's dataset ---
    normed_data.to_hdf(filename,key='/'.join([admin_lvl, indicator]),mode='a')
    return


# Runs the code when calling "python update_dashboard_data.py"
if __name__ =="__main__":
    update_dataset()
