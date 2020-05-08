# -*- coding: utf-8 -*-
"""
Created on Sat Jan 18 11:12:23 2020

@author: ABucherie
"""
#%%
# setting up your environment

import pandas as pd
import matplotlib as mpl
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import geopandas as gpd
from mpl_toolkits.axes_grid1 import make_axes_locatable

#%% Cell to change per country
    
country = 'Uganda'  
ct_code='uga'

#Path name to the folder : 
path = my_local_path + '/' + country + '/'

# Read the path to the relevant admin level shape to use for the study

#for Uganda activate the following lines :
Admin= path + 'input/Admin/uga_admbnda_adm1_UBOS_v2.shp'   # for Uganda
Admin_col = 'ADM1_EN'  # column name of the Admin name in the shapefile of Uganda

#for Kenya activate the following lines :
#Admin= path + 'input/Admin/KEN_adm1_mapshaper_corrected.shp' # for Kenya
#Admin_col = 'name'  # column name of the Admin name in the shapefile for Kenya

#for Mali activate the following lines :
#Admin= path + 'input/Admin/mli_admbnda_adm2_1m_dnct_20190802.shp' # for Mali
#Admin_col = 'ADM2_FR'  # column name of the Admin name in the shapefile for Mali

#activate  sources of the model perforfance results from the previous script V112_glofas
model_performance = path + 'output/Performance_scores/%s_glofas_performance_score_optimized.csv' %ct_code

#%% 
# Open the district admin 1 sapefile
district= gpd.read_file(Admin)
#open the csv file with performance results of the model
model_perf =pd.read_csv(model_performance)
model_perf =model_perf.dropna()

# find the best station to use per district based on the lowest FAR values and max POD
#### !! to be modified with the updated Optimized matrix : we want per district, the best couple ( station, threshold) that minimise FAR and maximize POD 
best= model_perf.groupby(['district', 'threshold'])['far'].transform(min)==model_perf['far']
model_perf_best= model_perf[best]

# lower case the district column in both file and merge
district[Admin_col]= district[Admin_col].str.replace(u"é", "e").str.lower()
model_perf_best['district']= model_perf_best['district'].str.lower()

merged_perf= district.set_index(Admin_col).join(model_perf_best.set_index('district')) 

# create a shapefile out of the uga_affected_area_stations.csv file:

AffArea_station =district.set_index(Admin_col).join(df_dg)
AffArea_station.to_file(path + 'output/Performance_scores/AffDistrict_%s_v112.shp' %ct_code, index=True)


#%% create 4 maps representing the results of the glofas model performance per district (POD, FAR, POFD and CSI)
quantiles = ['Q50_pred', 'Q80_pred', 'Q90_pred']

for quantile in quantiles:
    
    perf_quantile= merged_perf[merged_perf['quantile']== quantile]
    perf_quantile.to_file(path + 'output/Performance_scores/perf_%s_v111_%s.shp' % (ct_code, quantile) )
    
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16,16))
    fig.suptitle('Performance results of model v1.1.1 in %s (%s Glofas)' %(country, quantile),fontsize= 22,fontweight= 'bold', x=0.5, y=0.94)   
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
    perf_quantile.plot(ax=ax1,column='far', legend= True, vmin=0,vmax=1, cmap='coolwarm', cax=cax1)
    
    ax2.set_title('Probability of Detection (POD)', fontsize= 16)
    merged_perf.plot(ax=ax2, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax2,column='pod', legend= True, vmin=0,vmax=1, cmap='coolwarm_r', cax=cax2)
    
    ax3.set_title('Probability of False Detection (POFD)', fontsize= 16)
    merged_perf.plot(ax=ax3, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax3,column='pofd', legend= True, vmin=0,vmax=1, cmap='coolwarm', cax=cax3)
    
    ax4.set_title('Critical Success Index (CSI)', fontsize= 16)
    merged_perf.plot(ax=ax4, color='lightgrey', edgecolor='grey')
    perf_quantile.plot(ax=ax4,column='pod', legend= True, vmin=0,vmax=1, cmap='coolwarm_r', cax=cax4)
    

    fig.savefig(path + 'output/Performance_scores/%s_v111_%s.png' % (country, quantile))







