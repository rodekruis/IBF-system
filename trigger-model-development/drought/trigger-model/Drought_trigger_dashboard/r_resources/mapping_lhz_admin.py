
import os
import geopandas as gpd
from os import listdir
from os.path import isfile, join
import pandas as pd
import glob


path2 ='C:\\Users\\ATeklesadik\\OneDrive - Rode Kruis\Documents\\documents\\IBF-system\\trigger-model-development\\drought\\Drought_trigger_dashboard\\'

lhz = gpd.read_file(path2+'/shapefiles/Ethiopia/ET_LHZ_2018/ET_LHZ_2018.shp')
admin = gpd.read_file(path2+'/shapefiles/Ethiopia/eth-administrative-divisions-shapefiles/eth_admbnda_adm2_csa_bofed_20201008.shp')
gdf_lhz_admin_merged = gpd.sjoin(lhz,admin,  how="right", op='intersects')
gdf_lhz_admin_merged["area"] = gdf_lhz_admin_merged['geometry'].area
idx = gdf_lhz_admin_merged.groupby(['LZCODE'])['area'].transform(max) == gdf_lhz_admin_merged['area']
df = gdf_lhz_admin_merged[idx]
df[['FNID','LZCODE','ADM2_PCODE']]