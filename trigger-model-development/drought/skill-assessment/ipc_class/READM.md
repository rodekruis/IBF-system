# Script to calculate exposed population IPC-Class 3

This script can be used to calculate the exposed population to food security IPC-Class 3 (Crisis Situation) from FEWSNET Food Security Outlook. The script makes use of the Google Earth Engine to download the data from FEWSNET. 

Make sure you have access to Google Earth Engine in order to extract the data. 

## Usage: 
The script exists of two parts, whereby the first part. `1. Download data from FEWSNET via Google Earth Engine` will guide you trough the downloading process of the FEWSNET Outlooks via GEE. If you have downloaded the data, you can start the script from `2. RUN SCRIPT FROM HERE IF YOU HAVE THE DATA ALREADY' 

### Data input: 
-	`livelihood zones`: https://fews.net/content/zimbabwe-livelihood-zones-2011<br>
-	`admin boundaries`: https://data.humdata.org/dataset/zimbabwe-administrative-levels-0-3-boundaries<br>
-	FEWSNET Outlook via GEE

One Drive Locations
-	`livelihood zones`: OneDrive folder - C:/Users/..../Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/ZW_LHZ_2011.shp
-	`admin boundaries`: OneDrive folder - C:/Users/.../Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/Admin/zwe_admbnda_adm0_zimstat_ocha_20180911/
-	`Population data` :  OneDrive folder - C:/Users/.../Rode Kruis/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/Admin/pop_recalc.shp

To download the FEWSNET Outlook data make sure you have the right folder structure in place:
-	…/data/Shapefile
-	…/data/Shapefile/South_Africa_Zips

