# Flood trigger model
This repository contains  scripts for the different steps involved in Impact based forecasting (IBF) model development 
The scripts avilable in this repo grouped into the fowllowing catgories. Geo spatial data needed for running the scripts are stored in 510geonode server. For running the scripts please check  Geo_setting.R for name of variables for retriving data from 510geonode server.  
## 1. [Understanding the risk](https://github.com/rodekruis/Flood_impact_models/blob/master/scripts/understanding_the_risk.R)
Impacts from natural disasters in the historical period will be analyised to understand the existing risk, both on economies and people's lives. we developed a scipt which is used to asses flood/drought risk based on historical data.

Input
* Admin boundaries and impact data are uploaded on 510 geonode server
* Geo_setting.R file is updated with layer names for these datasets

Output
* The outcome of this analysis is a risk map, which is based on historical impact data 

Ethiopia Risk Analysis Example
![Example of risk analysis for Ethiopia](https://github.com/rodekruis/Flood_impact_models/blob/master/output/Ethiopia/affected_annimation.gif)
 
Kenya Risk Analysis Example
![Example of risk analysis for Kenya](https://github.com/rodekruis/Flood_impact_models/blob/master/output/Kenya/kenya_impact.gif)

Uganda Risk Analysis Example
![Example of risk analysis for Uganda](https://github.com/boukepieter/IBF-system/blob/master/trigger-model-development/flood/trigger-model/output/uganda/Uganda_impact.gif)

## 2. [Impact hazard catalogue](https://github.com/rodekruis/Flood_impact_models/blob/master/scripts/impact_hazard_catalog.R)
A script which link impact (which was analyzed in understanding the risk part) with Hazard. Hydro-Met data will be used as a             proxy for discribing hazard.

Input
* Admin boundaries and impact data are uploaded on 510 geonode server
* Geo_setting.R file is updated with layer names for these datasets
* River discharge/Rainfall data

Output
* An Impact Hazard Catalog (A csv file with a daily record of flood impact and associated Hazard) 
* a shyny app to easily visualize impact hazard catalog 
![shyny app for visualizing impact-hazard catalog data) Ethiopia](https://github.com/rodekruis/Flood_impact_models/blob/master/output/hazard_impact_catalog.PNG)
* plots for each events showing Impact and Hazard link(For EAP)
* The outcome of this analysis is a hazard-impact catalog, which will be an input for the trigger table(next step)

### Hazard river discharge based on GLOFAS
Example of impact-hazard analysis for a single event(hazard is based on glofas data) Ethiopia
![Example of impact-hazard analysis for a single event(hazard is based on glofas data) Ethiopia](https://github.com/rodekruis/Flood_impact_models/blob/master/output/hazard_impact.PNG)
Example of impact-hazard analysis for a single event(hazard is based on glofas data) Kenya
![Example of impact-hazard analysis for a single event(hazard is based on glofas data) Kenya](https://github.com/rodekruis/Flood_impact_models/blob/master/output/hazard_impact_kenya.PNG)
### Hazard rainfall based on NAM hstorical data
Example of impact-hazard analysis for a single event(hazard is based on NAM rainfall data) Ethiopia
![Example of impact-hazard analysis for a single event(hazard is based on NAM RAINFALL Data) Ethiopia](https://github.com/rodekruis/Flood_impact_models/blob/master/output/hazard_impact_ethiopia_rainfall.PNG)

## 3. Trigger model development
Here we build a trigger model based on data from Impact-hazard catalogue    
## 4. Visualization of trigger model
easy visualization of the IBF model results for descion makers ds for 
## 5. Intervention maps (combining vulnerability index with exposure and hazard maps )
Geo spatial data needed for running the scripts are stored in 510geonode server. For running the scripts check list of variables in Geo_setting.R
    
    
### Notes      
To run catchment extractor script addtional data is needed - this can be found in the following link https://rodekruis.sharepoint.com/:f:/s/510-CRAVK-510/EhG4P2uRQRZKjZiJlo7YMYwBs5sqYxzcHmElbF4GtCGF6Q?e=g2mdMV

## GLOFAS data
* [Uganda river discharge, 2000-2019](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/Gedeelde%20%20documenten/%5BCTRY%5D%20Uganda/2-%20IBF%20FLOOD%20UGANDA/FLOOD%20INDICATORS%20ANALYSIS/GLOFAS_ANALYSIS/uga_glofas_all.nc)
* [Kenya river discharge, 2000-2019](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/Gedeelde%20%20documenten/%5BCTRY%5D%20Kenya/FLOOD%20INDICATOR%20ANALYSIS/kenya_glofas_all.nc)
* Old files:
https://rodekruis.sharepoint.com/sites/510-CRAVK-510/Gedeelde%20%20documenten/FbF%20-%20Mali%20-%20RPII/Trigger%20methodology/glofas2.nc.tar
