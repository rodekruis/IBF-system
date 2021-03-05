# Script to calculate DMP and crop yield correlation

This script is to calculate the correlation between Dry Matter Productivity (DMP) and crop yield.
Outputs are csv files showing the correlation score of the yield of a crop type vs the DMP. A figure of the correlation per livelihood zones is also plotted.

Mind the input/output filenames because there are more than one type of crop.

## Data input:
Edit the input directories in the script before running.

- DMP `dmp`: a csv contained DMP data per date per livelihood zones.
It is extracted from the global DMP dataset by the script [extract_dmp_yield.R](https://github.com/rodekruis/IBF-system/blob/master/trigger-model-development/drought/skill-assessment/DMP-VCI-Analysis/dmp_crop_yield_comparison/extract_dmp_yield.R).
Data can be found in MS Teams `.../510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/dmp/`. 

- Yield `yield`: a csv contained yield data per year per livelihood zones. For Zimbabwe, there are `all_yield_maize_major`, `all_yield_maize_second` and `all_yield_wheat`.
The data is extracted from the global crop yield dataset by the script [extract_dmp_yield.R](https://github.com/rodekruis/IBF-system/blob/master/trigger-model-development/drought/skill-assessment/DMP-VCI-Analysis/dmp_crop_yield_comparison/extract_dmp_yield.R)
Data can be found in MS Teams `.../510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_cropyield/`. 

- Shapefile of the livelihood zones `lhz`. Data can be found in MS Teams `/510 - Data preparedness and IBF - [PRJ] FbF - Zimbabwe - Danish Red Cross/3. Data - Hazard exposure, vulnerability/zwe_livelihoodzones/ZW_LHZ_2011/ZW_LHZ_2011.shp`

## Note
Please make sure the folder `results` is in the same folder as the script. 
