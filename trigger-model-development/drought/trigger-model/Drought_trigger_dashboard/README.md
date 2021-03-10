# Drought Impact Hazard catalog and Trigger Dashboard
This repository contains  scripts for Drought impact-hazard catalog and threshold development, which is a data scrambling step in 510 Impact based forecasting (IBF) model development 
Geo spatial data needed for running the scripts are stored in 510geonode server. For running the scripts please check  Geo_setting.R for name of variables for whcih data will be retrived from 510geonode server.
  
## 1. Understanding the risk
Impacts from natural disasters in the historical period will be analyised to understand the existing risk, both on economies and people's lives.  Asseing drought risk based on historical data.

Input
* Admin boundaries and impact data are uploaded on 510 geonode server
* Geo_setting.R file is updated with layer names for these datasets
* IMpact data base

Output
* The outcome of this analysis is a risk map, which is based on historical impact data 

Ethiopia Drought Risk Analysis Example
![Example of risk analysis for Ethiopia](
https://github.com/rodekruis/IBF-system/tree/master/trigger-model-development/drought/trigger-model/Drought_trigger_dashboard/output/ethiopia_impact.png)
 

## 2. Impact hazard catalogue
A time series matrix with drought event,biophysical indicators and climate variables aggregated per admin/livelyhood zone boundaries.

Input
* Admin boundaries and impact data are uploaded on 510 geonode server
* Geo_setting.R file is updated with layer names for these datasets
* climate variables
* Bio-pyhsical indicators

Output
* An Impact Hazard Catalog (A csv file with a daily record of drought impact and associated Hazard indicators) 
* plots for each events showing Impact and Hazard link(For EAP)
* The outcome of this analysis is a hazard-impact catalog, which will be an input for the trigger table(next step)


## 3. Visualization of trigger model
easy visualization of the IBF model results for descion makers 

* a shyny app to easily visualize impact hazard catalog 
    
### Notes      
