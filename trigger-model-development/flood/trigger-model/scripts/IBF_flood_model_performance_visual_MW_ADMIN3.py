# -*- coding: utf-8 -*-
"""
Created on Sat Jan 18 11:12:23 2020

@author: ABucherie
"""
#%%
# setting up your environment
from pathlib import Path
import xarray as xr
import pandas as pd
import matplotlib as mpl
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
import os
from os import listdir
from os.path import isfile, join
import geopandas as gpd
from shapely.geometry import Point
# from osgeo import ogr
# import xshape
# import rasterio
# from rasterstats import zonal_stats
# import fiona
from mpl_toolkits.axes_grid1 import make_axes_locatable

#%% 
# sources
mypath = str(Path(os.getcwd()).parent)
model_performance = mypath + '/output/malawi/glofas_analysis/mwi_glofas_performance_score.csv'
district_mwi = mypath + '/shapes/malawi/mwi_adm_nso_20181016_shp/mwi_admbnda_adm3_nso_20181016.shp'

#%% 
# Open the district admin 1 sapefile
district = gpd.read_file(district_mwi)
#open the csv file with performance results of the model
model_perf = pd.read_csv(model_performance)

# find the best station to use per district based on the lowest FAR values
best = model_perf.groupby(['Dist_PCODE', 'quantile'])['far'].transform(min)==model_perf['far']
model_perf_best= model_perf[best]

# lower case the district column in both file and merge
# district['ADM3_EN']= district['ADM3_EN'].str.lower()
# model_perf_best['District']= model_perf_best['District'].str.lower()

merged_perf= district.set_index('ADM3_PCODE').join(model_perf_best.set_index('Dist_PCODE')) 
merged_perf.to_file(mypath + '/output/malawi/performance_scores/perf_mwi_v111.shp')

#%%  create a figure with the number of flood event recorded per district
fig, ax=plt.subplots(1,figsize=(10,10))
divider = make_axes_locatable(ax)
cax = divider.append_axes("right", size="5%", pad=0.2)

merged_perf.plot(ax=ax, color='lightgrey', edgecolor='grey')
ax.set_title('Number of recorded flood event per district', fontsize= 14)
cmap = cm.get_cmap('jet', 10)
#cmap = cm.get_cmap('gist_ncar_r', 10)

perfdrop= merged_perf.dropna(subset=['nb_event'])
perfdrop.plot(ax=ax,column='nb_event', legend= True,vmin=1,vmax=10, cmap=cmap, cax=cax)

fig.savefig(mypath + '/output/malawi/performance_scores/Nb_event_district.png')

#%% 
#choose the quantile to plot 
#perf_quantile= merged_perf[merged_perf['quantile']== 'Q90_pred']

quantiles = ['Q50_pred', 'Q80_pred', 'Q90_pred']

for quantile in quantiles:
    
    perf_quantile= merged_perf[merged_perf['quantile']== quantile]
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16,16))
    #title("Title", line = -2)
    fig.suptitle('Performance results of model v1.1.1 in Malawi (%s Glofas)'%quantile,fontsize= 22,fontweight= 'bold', x=0.5, y=0.94)   
    divider_ax1 = make_axes_locatable(ax1)
    divider_ax2 = make_axes_locatable(ax2)
    divider_ax3 = make_axes_locatable(ax3)
    divider_ax4 = make_axes_locatable(ax4)
    cax1 = divider_ax1.append_axes("right", size="5%", pad=0.2)
    cax2 = divider_ax2.append_axes("right", size="5%", pad=0.2)
    cax3 = divider_ax3.append_axes("right", size="5%", pad=0.2)
    cax4 = divider_ax4.append_axes("right", size="5%", pad=0.2)
    
    ax1.set_title('False Alarm Ratio (FAR)', fontsize= 16)
    merged_perf.plot(ax=ax1, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax1,column='far', legend= True, vmin=0, vmax=1, cmap='coolwarm', cax=cax1)
    
    ax2.set_title('Proability of Detection (POD)', fontsize= 16)
    merged_perf.plot(ax=ax2, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax2,column='pod', legend= True, vmin=0, vmax=1, cmap='coolwarm_r', cax=cax2)
    
    ax3.set_title('Proability of False Detection (POFD)', fontsize= 16)
    merged_perf.plot(ax=ax3, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax3,column='pofd', legend= True, vmin=0, vmax=1, cmap='coolwarm', cax=cax3)
    
    ax4.set_title('Critical Success Index (CSI)', fontsize= 16)
    merged_perf.plot(ax=ax4, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax4,column='pod', legend= True, vmin=0, vmax=1, cmap='coolwarm_r', cax=cax4)
    

    fig.savefig(mypath + '/output/malawi/performance_scores/Malawi_v111_%s.png' %quantile)


#%% try multiplot 
merged_perf.plot(ax=ax, color='lightgrey', edgecolor='grey')

ax.set_title('FAR results of model v1.1.1 in Malawi (Glofas only)', fontsize= 12)
perfdrop= merged_perf.dropna(subset=['far'])
perfdrop.plot(ax=ax,column='far', legend= True, cmap='coolwarm', cax=cax)





