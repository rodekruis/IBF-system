# -*- coding: utf-8 -*-
"""
Script to download and merge data.
Set start and end year in the function.
Output is a folder with a '.nc' file for each month with the discharge levels per day/gridd.
"""
import xarray as xr
import os
import cdsapi
import zipfile
import shutil

months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

def download_and_merge(year_start=2010, year_end=2019):
    """"
    download global glofas data and merge it per year
    """

    c = cdsapi.Client()
    glofas_year_dir = 'data_all_'+str(year_start)+'_'+str(year_end)
    if not os.path.exists(glofas_year_dir):
        os.mkdir(glofas_year_dir)
      # create folder for year data merge

    # loop over years and months
    for year in range(year_start, year_end+1):

        for month in range(1,13):

            if os.path.isfile(glofas_year_dir + '/' + str(year) + '_' + str(month) + '_merged.nc'):
                continue
            print(str(year) + '_' + str(month))

            # download zip file
            glofas_month_dir = str(year) + '_' + str(month)
            if not os.path.exists(glofas_month_dir):
                os.mkdir(glofas_month_dir)
            try:
                c.retrieve(
                    'cems-glofas-historical',
                    {
                        'format': 'netcdf',
                        'variable': 'river_discharge_in_the_last_24_hours',
                        'dataset': 'consolidated_reanalysis',
                        'system_version': 'version_2_1',
                        'hyear': str(year),
                        'hmonth': months[month-1],
                        'hday': [
                            '01', '02', '03',
                            '04', '05', '06',
                            '07', '08', '09',
                            '10', '11', '12',
                            '13', '14', '15',
                            '16', '17', '18',
                            '19', '20', '21',
                            '22', '23', '24',
                            '25', '26', '27',
                            '28', '29', '30',
                            '31',
                        ],
                    },
                    glofas_month_dir + '/download.nc')
            except:
                continue

            # merge monthly data in one dataframe
            ncconcat = xr.Dataset()
            for ix, file in enumerate(os.listdir(glofas_month_dir)):
                nc = xr.open_dataset(glofas_month_dir+'/'+file)
                if ix == 0:
                    ncconcat = nc
                else:
                    ncconcat = xr.concat([ncconcat, nc], dim='time')  # to concatenate the .nc on time
                

            # save new dataframe
            ncconcat.to_netcdf(glofas_year_dir+'/'+str(year)+'_'+str(month)+'_merged.nc')
            
            nc.close()
            ncconcat.close()
            del nc
            del ncconcat
            # remove monthly data to save space
            shutil.rmtree(glofas_month_dir)
  

## Set workdirectory if you want to make sure data will be stored in a certain folder
#path = 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis'
#os.chdir(path)
          
download_and_merge()




