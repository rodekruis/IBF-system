# -*- coding: utf-8 -*-
"""
Created on Wed Nov 20 10:54:39 2019

@author: ATeklesadik, ABucherie, PPhung

"""

from pathlib import Path
import os
import geopandas as gpd
import fiona
import descartes
from osgeo import ogr
from shapely.geometry import Polygon
import numpy as np

#%%
################################# 
def add_to_list(items,list_):
    for elments in items:
        if elments not in list_:
            list_.append(elments)
    return list_


#%%  CELL TO UPDATE DEPENDING ON THE COUNTRY and ADMIN LEVEL OF INTEREST  
country = 'Uganda'

my_local_path = str(Path(os.getcwd()))
path = my_local_path + '/' + country + '/'

#choose with hydroshd basin order to work with ( recommended level 12)
Hydroshed_order = '12'
hydroshed_basin= my_local_path + '/Africa/Hydroshed/hybas_lake_af_lev%s_v1c.shp' % (Hydroshed_order)

# Path to the administrtative level file of the country we want to extract the catchment from
Admin_path= path + 'input/Admin/uga_admbnda_adm1_UBOS_v2.shp' 

#Name of the Pcode and Admin name columns of interest in the admin shapefile we are using
Pcode= 'ADM1_PCODE'
Adm_name = 'ADM1_EN'

#Path to folder where to save the catchment shapefiles
Path_output = path + 'input/Catchment_area_per_district/' 
 
 #%% ################################# run the code for one sample admin 

Admin_shape = gpd.read_file(Admin_path)
basin = gpd.read_file(hydroshed_basin) # read hydroshed shapefile
basin = basin.loc[basin['LAKE'] == 0] # select sub-basins not in a lake

catchment = gpd.GeoDataFrame()

for admin in np.unique(Admin_shape[Adm_name].values):

    print(admin)
    sample_admin = Admin_shape[Admin_shape[Adm_name] == admin]  
    
    list_con = [] # create list to store selected basin ID
    threshold = 25000 # based on UP_AREA
    
    basin_check1 = gpd.overlay(basin, sample_admin, how='intersection') # overlay hydroshed with district shapefile

    list_con = add_to_list(basin_check1['HYBAS_ID'].values, list_con) # save basin ID to list

    for j in list_con: # loop to find upstream for each basin from the list
            
        item = basin[(basin['NEXT_DOWN'] == j) & (basin['UP_AREA'] <= threshold)]
        list_con = add_to_list(item['HYBAS_ID'].values, list_con)
            
    catchment1 = basin[basin['HYBAS_ID'].isin(list_con)]
    
    catchment1 = catchment1.drop(columns = ['HYBAS_ID', 'NEXT_DOWN', 'NEXT_SINK', 'MAIN_BAS', \
                                            'DIST_SINK', 'DIST_MAIN', 'SUB_AREA', 'UP_AREA', \
                                            'PFAF_ID', 'SIDE', 'LAKE', 'ENDO', 'COAST', 'ORDER', 'SORT'])
    catchment1['ADMIN'] = admin
    catchment = catchment.append(catchment1)

event_tc = catchment.dissolve(by='ADMIN', as_index=False)
event_tc.to_file(Path_output +'Catchment_%s_1.shp' %country)
