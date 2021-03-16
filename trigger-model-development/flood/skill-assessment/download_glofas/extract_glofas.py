# -*- coding: utf-8 -*-
"""
Created on Fri Mar 12 12:49:09 2021

@author: BOttow
"""

import xarray as xr
import pandas as pd
 
# reading GloFAS GRIB file
file = 'c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [CTRY] Uganda/GIS Data/GloFAS/199901_5dayLT.grib'
ds = xr.open_dataset(file,engine='cfgrib')
station_file = 'c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [CTRY] Uganda/IBF Dashboard data/rp_glofas_station_uga_v2.csv' 
stations = pd.read_csv(station_file)

step = 5
ensemble = list(range(1,10))
ds['dis24'].sel(longitude=stations['lon']-0.05, latitude=stations['lat']-0.05, number=ensemble).values
ds['dis24'].sel(longitude=[33.9], latitude=[0.9], number=ensemble).values