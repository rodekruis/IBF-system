# Getting started
To make sure you have all the required Python packages, the following can be used (in your terminal or command line)
```
pip install requirements.txt
```

# Updating the metereological time-series data
Simply run the code using: 
```
python update_dashboard_data.py
```
The code will ask you to enter: 
1. **country code:** for example 'eth' for Ethiopia or 'zwe' for Zimbabwe
2. **administration level: **. Enter 'adm1','adm2' or 'adm3' (including the 'adm')
3. **How many satelite products/metereological indicators do you want to update?**. Enter any integer number 
4. **For the number of products from the Copernicus satelite service you requested, enter their names**. For example, for dry matter productivity, we use 'dmp_v2_1km'.
5. **Range of dates for which we need to obtain rasterfiles from Copernicus**. If you do not enter anything (by just immediately hitting the return/enter key) the code will, for every indicator/Copernicus product, infer what was the last time you used this code to update and it will run until the day of running the code ('today'). 
6. **Login details for Copernicus satelite** 


# What happens under-the-hood? 
The code will 
1. download the shapefile for the country + administration level entered from Geonode service. **NOTE:** the geonode service was not working, so for now the code is hardcoded to work with a shapefile from ethopia admin level 1. 
2. download the raster files from Copernicus. It will download the rasterfiles (netCFD files) for the given date ranges and products 
3. use the GlobCover data to obtain polygons of croplands for every administration in the original shape file
4. determine the average value for every adminstration, only using the croplands
5. convert to a time series data 
6. determine 'normalized' time series by 'standardizing' values belonging to the same district/administration and day of the year. (for example 2020-06-11 and 2019-06-11).
7. store the final output time series data table into a 'HDF5' file. 
8. delete all other files (including the shapefile from GeoNode, netCFD from Copernicus + temporary zonal statistics files)

The code outputs a file into the folder `/processed_data` (which will automatically be created if not present). 
The resulting HDF5-file is a convenient way of storing large amounts of data. HDF5-files are structured similarly to directories on your computer. 
Namely, just as a directory can have subdirectories (subfolders) and files inside of it, a HDF5-file contains 'groups' of 'datasets'. 
Also, just like you would access a file within a directory using `sub_directory/file_name`, each dataset within a HDF5 has a key
`group_name/dataset_name`. 
After running the code, you will end up with a file `processed_data/<COUNTRY CODE>_meteorological_drought_indicators.hdf5`. 
The HDF5-format allows us to simply use a single file per country, with groups named after the administration level and datasets named after the indicator. 
For example, the dataset with key  `adm1/DMP` contains a data table as follows: 

| pcode | area | year | month | day | date | DMP | DMP_normed|
| ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| all data for first region sorted by date |
| ... |
| all data for second region sorted by date |
| ... |

using `Pandas` one can readily access the data, 
```python
import pandas as pd 

fileName = "processed_data/eth_meteorological_drought_indicators.hdf5"
TimeSeriesData = pd.read_hdf(fileName, key='adm1/DMP')
```
, visualize the timeseries for an administration, 

```python
import matplotlib.pylab as plt 

# --- use Pandas to get data per administration --- 
for adminName, adminData in timeSeriesData.groupby("area"):
    
    # -- use the date collumn + Pandas to display 'an actual date' on horizontal axis --- 
    plt.plot( pd.to_datetime(adminData['date']) , adminData['DMP'] )

```
, or compare DMP values amongts administrations on a particular date: 
```python
dateData = timeSeriesData[timeSeriesData['date'] == "2018-06-30"]
plt.barh( dateData['area'], dateData['DMP'] )

```
