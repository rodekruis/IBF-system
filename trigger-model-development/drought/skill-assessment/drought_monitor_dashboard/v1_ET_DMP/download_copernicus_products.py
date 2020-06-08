# -*- coding: utf-8 -*-
"""
Created on Wed Jun  3 15:04:01 2020

@author: ATeklesadik
"""

import requests
from requests.auth import HTTPBasicAuth
import os


PATH       = "C:/land.copernicus/" #INSERT TARGET DIRECTORY, for example: C:/land.copernicus
USERNAME   = "aklilu" #INSERT USERNAME
PASSWORD   = "pass1234" #INSERT PASSWORD
#TIMEFRAME  = seq(as.Date("2019-06-01"), as.Date("2019-06-15"), by="days") #INSERT TIMEFRAME OF INTEREST, for example June 2019
VARIABLE   = "lai" #INSERT PRODUCT VARIABLE;(for example fapar) -> CHOSE FROM fapar, fcover, lai, ndvi,  ssm, swi, lst, ...
RESOLUTION = "1km" #INSERT RESOLTION (1km, 300m or 100m)
VERSION    = "v1" #"INSERT VERSION: "v1", "v2", "v3",... 


collection = "_".join([VARIABLE,VERSION,RESOLUTION])
os.mkdir(os.path.join(PATH, collection) ) 
productlink="https://land.copernicus.vgt.vito.be/manifest/"+collection+ "/manifest_cgls_"+ collection+ "_latest.txt"
#url <- paste0("https://", paste(USERNAME, PASSWORD, sep=":"), product.link)

file_url ='https://land.copernicus.vgt.vito.be/manifest/lai_v1_1km/manifest_cgls_lai_v1_1km_latest.txt'

r = requests.get(file_url, allow_redirects=True)

open(os.path.join(PATH,'temp_content.txt'), 'wb').write(r.content)

filename=open(os.path.join(PATH,'temp_content.txt'), 'r')
 
for lines in filename.readlines()[0:1]: ## here i am downloading the first file for test you should channge this to download all layers 
    r=requests.get(lines.strip('\n'), auth=HTTPBasicAuth(USERNAME, PASSWORD))
    open(os.path.join(PATH,collection,lines.strip('\n').split('/')[-1]), 'wb').write(r.content)    
    print(lines.strip('\n'))
 
filename.close()

